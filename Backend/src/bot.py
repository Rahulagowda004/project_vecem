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
from src.database.mongodb import user_profile_collection

# Load environment variables
load_dotenv()

class FRIDAY:
    def __init__(self, uid: str = None):
        if not uid:
            raise ValueError("User ID is required")
        
        self.uid = uid
        self.api_key = None
        self.model = None
        self.chat_history = ChatMessageHistory()
        self.output_parser = StrOutputParser()
    
    async def initialize(self):
        # Fetch API key from user profile every time
        user = await user_profile_collection.find_one({"uid": self.uid})
        if not user or not user.get("api_key"):
            raise ValueError("API key not found for user")
        
        self.api_key = user["api_key"]
        self.model = ChatGoogleGenerativeAI(
            model="gemini-1.5-pro",
            api_key=self.api_key,
            temperature=0.7
        )

    def setup_chain(self) -> RunnableWithMessageHistory:
        """Set up the prompt and chain with the model."""
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", """You are Vecora, an expert prompt engineer specializing in crafting precise, context-driven system messages for AI agents.
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

    async def get_response(self, message: str) -> str:
        """Handle a single message and return the response."""
        try:
            # Re-initialize to get fresh API key for each request
            await self.initialize()

            if not self.api_key:
                raise ValueError("API key not initialized. Please ensure you have set up your API key.")

            chain = self.setup_chain()
            with_message_history = RunnableWithMessageHistory(
                chain,
                lambda _: self.chat_history
            )

            config = {"configurable": {"session_id": "temp"}}
            response_text = ""

            async for chunk in with_message_history.astream(
                [HumanMessage(content=message)],
                config=config
            ):
                parsed_output = self.output_parser.parse(chunk.content)
                cleaned_output = parsed_output.replace("*", "").replace("\n", " ").strip()
                response_text += cleaned_output + " "

            return response_text.strip()

        except ValueError as ve:
            logging.error(f"API key error: {str(ve)}")
            return "I apologize, but there seems to be an issue with your API key. Please check your API key settings."
        except Exception as e:
            logging.error(f"Error processing message: {str(e)}")
            return "Enter a valid API key to continue."

    async def chat(self) -> None:
        """Main chat loop with error handling."""
        bot_name = "FRIDAY"
        try:
            chain = self.setup_chain()
            session_id = str(uuid.uuid4())
            with_message_history = RunnableWithMessageHistory(
                chain,
                lambda _: self.chat_history
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

                    config = {"configurable": {"session_id": session_id}}
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