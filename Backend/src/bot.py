import os
import uuid
from src.utils.logger import logging
from datetime import datetime, timedelta
from typing import Optional, Dict
from dotenv import load_dotenv
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv()

class FRIDAY:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.chat_history = {}
        self.rate_limits = {}  # Store rate limiting info per user
        
    def setup_model(self, api_key: str):
        """Initialize model with user's API key"""
        try:
            self.model = ChatGoogleGenerativeAI(
                model="gemini-1.5-pro",
                api_key=api_key,
                temperature=0.7
            )
            return True
        except Exception as e:
            logging.error(f"Error initializing model: {str(e)}")
            return False

    def check_rate_limit(self, uid: str) -> bool:
        """Check if user has exceeded Google AI Studio free tier rate limits"""
        now = datetime.now()
        user_limits = self.rate_limits.get(uid, {
            'requests': 0,
            'reset_time': now + timedelta(minutes=1),  # Reset every minute
            'daily_requests': 0,
            'daily_reset': now + timedelta(days=1)
        })

        # Reset minute counter if time window has passed
        if now >= user_limits['reset_time']:
            user_limits['requests'] = 0
            user_limits['reset_time'] = now + timedelta(minutes=1)

        # Reset daily counter if day has passed
        if now >= user_limits['daily_reset']:
            user_limits['daily_requests'] = 0
            user_limits['daily_reset'] = now + timedelta(days=1)

        # Check request limits (60 requests per minute)
        if user_limits['requests'] >= 60:
            return False

        # Check daily limit (free tier typically has a daily quota)
        if user_limits['daily_requests'] >= 250:  # Conservative daily limit
            return False

        # Update limits
        user_limits['requests'] += 1
        user_limits['daily_requests'] += 1
        self.rate_limits[uid] = user_limits
        return True

    def setup_chain(self) -> RunnableWithMessageHistory:
        """Set up the prompt and chain with the model."""
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", """You are Vecem, an expert prompt engineer specializing in crafting precise, context-driven system messages for AI agents.
                When the user explicitly requests a system message, ask up to 4 targeted questions only if their request is ambiguous or lacks critical details. Focus on clarifying the agent's goal, role, format, constraints, and relevant context.
                If the user's input is clear, generate a highly effective system message without unnecessary follow-ups.
                If the user sends a casual greeting or any non-system-message request, respond naturally with initiating topics about the current project they are working on.
                Your objective is to ensure clarity, relevance, and usability in system messages, as if you were collaborating with a human partner. Avoid over-questioning and keep communication natural.
                """),
                MessagesPlaceholder(variable_name="thinking")
            ])
            return prompt | self.model
        except Exception as e:
            logging.error(f"Error setting up chain: {str(e)}")
            raise

    async def get_response(self, message: str, uid: str, api_key: str) -> str:
        """Handle a single message with rate limiting and user's API key"""
        try:
            # Check rate limits
            if not self.check_rate_limit(uid):
                return "Rate limit exceeded. Please try again later."

            # Setup/update model with user's API key
            if not self.setup_model(api_key):
                return "Error initializing chat model. Please check your API key."

            # Process message
            response = await self.model.apredict(message)
            return response.content

        except Exception as e:
            logging.error(f"Error in chat response: {str(e)}")
            return "I encountered an error. Please try again."

    async def chat(self) -> None:
        """Main chat loop with error handling."""
        bot_name = "FRIDAY"
        try:
            chain = self.setup_chain()
            with_message_history = RunnableWithMessageHistory(
                chain,
                lambda _: self.chat_history  # Use single chat history for temporary storage
            )
            logging.info("Chat session started")
            print(f"{bot_name}: Hey, how can I help you today?\n")

            while True:
                try:
                    user_input = input("you: ").strip()
                    if not user_input:
                        continue
                        
                    if user_input.lower() in ['exit', 'quit', 'bye']:
                        print(f"{bot_name}: Goodbye, Have a nice day.")
                        break

                    config = {"configurable": {"session_id": "temp"}}
                    print(f"{bot_name}: ", end="", flush=True)

                    async for chunk in with_message_history.astream(
                        [HumanMessage(content=user_input)],
                        config=config
                    ):
                        parsed_output = self.output_parser.parse(chunk.content)
                        cleaned_output = parsed_output.replace("*", "").replace("\n", " ").strip()
                        structured_output = " ".join(cleaned_output.split())
                        print(structured_output, end=" ", flush=True)
                    print()

                except Exception as e:
                    logging.error(f"Error processing message: {str(e)}")
                    print(f"{bot_name}: I apologize, but I encountered an error. Please try again.")

        except Exception as e:
            logging.error(f"Fatal error in chat session: {str(e)}")
            print(f"{bot_name}: I'm sorry, but I'm experiencing technical difficulties.")

if __name__ == "__main__":
    import asyncio
    try:
        bot = FRIDAY()
        asyncio.run(bot.chat())
    except Exception as e:
        logging.critical(f"Application failed to start: {str(e)}")