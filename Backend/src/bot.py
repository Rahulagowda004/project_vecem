import os
import uuid
from src.utils.logger import logging
from datetime import datetime, timedelta
from typing import Optional, Dict
from dotenv import load_dotenv
import textwrap
from termcolor import colored
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from itertools import chain

# Load environment variables
load_dotenv()

class FRIDAY:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.chat_history = {}
        self.rate_limits = {}  # Store rate limiting info per user
        self.terminal_width = os.get_terminal_size().columns
        self.output_parser = StrOutputParser()
        
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
            response = await self.model.ainvoke(message)
            return response.content

        except Exception as e:
            logging.error(f"Error in chat response: {str(e)}")
            return "The provided API key is invalid or has exceeded the rate limit. Please verify your key and try again."

    def format_response(self, text: str) -> str:
        """Format the response with enhanced justification and styling"""
        width = min(self.terminal_width - 12, 80)  # Reduced width for better readability
        
        # Split into paragraphs and clean up
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        formatted_paragraphs = []
        
        for paragraph in paragraphs:
            if paragraph.startswith(('*', '-', '1.')):  # List items
                # Handle lists with proper indentation
                lines = paragraph.split('\n')
                formatted_lines = [' ' * 4 + line.strip() for line in lines]
                formatted_paragraphs.append('\n'.join(formatted_lines))
            else:
                # Regular paragraph justification
                words = paragraph.split()
                lines = []
                current_line = []
                current_length = 0
                
                for word in words:
                    word_length = len(word)
                    if current_length + word_length + len(current_line) <= width:
                        current_line.append(word)
                        current_length += word_length
                    else:
                        if current_line:
                            # Justify the line
                            if len(current_line) > 1:
                                spaces_needed = width - current_length
                                gaps = len(current_line) - 1
                                space_per_gap = spaces_needed // gaps
                                extra_spaces = spaces_needed % gaps
                                
                                justified = ''
                                for i, w in enumerate(current_line[:-1]):
                                    extra = 1 if i < extra_spaces else 0
                                    justified += w + ' ' * (space_per_gap + extra)
                                justified += current_line[-1]
                                lines.append(justified)
                            else:
                                lines.append(current_line[0])
                        
                        current_line = [word]
                        current_length = word_length
                
                # Handle the last line
                if current_line:
                    lines.append(' '.join(current_line))
                
                formatted_paragraphs.append('\n'.join(lines))
        
        # Add decorative borders with extra padding
        border = '═' * (width + 6)
        formatted_text = '╔' + border + '╗\n'
        
        # Add paragraphs with proper spacing
        for i, paragraph in enumerate(formatted_paragraphs):
            formatted_text += '║  ' + ' ' * 2
            paragraph_lines = paragraph.split('\n')
            
            for j, line in enumerate(paragraph_lines):
                if j > 0:
                    formatted_text += '║  ' + ' ' * 2
                formatted_text += line.ljust(width) + '  ║\n'
            
            # Add spacing between paragraphs
            if i < len(formatted_paragraphs) - 1:
                formatted_text += '║' + ' ' * (width + 6) + '║\n'
        
        formatted_text += '╚' + border + '╝'
        return formatted_text

    async def chat(self) -> None:
        """Main chat loop with error handling."""
        bot_name = colored("FRIDAY", 'cyan', attrs=['bold'])
        try:
            chain = self.setup_chain()
            with_message_history = RunnableWithMessageHistory(
                chain,
                lambda _: self.chat_history  # Use single chat history for temporary storage
            )
            logging.info("Chat session started")
            print(f"\n{bot_name}: Hey, how can I help you today?\n")

            while True:
                try:
                    user_input = input(colored("\nYou: ", 'green')).strip()
                    if not user_input:
                        continue
                        
                    if user_input.lower() in ['exit', 'quit', 'bye']:
                        print(f"\n{bot_name}: Goodbye, Have a nice day.")
                        break

                    config = {"configurable": {"session_id": "temp"}}
                    print(f"\n{bot_name}:", end="\n\n")

                    response_chunks = []
                    async for chunk in with_message_history.astream(
                        [HumanMessage(content=user_input)],
                        config=config
                    ):
                        response_chunks.append(chunk.content)
                    
                    full_response = ' '.join(response_chunks)
                    formatted_response = self.format_response(full_response)
                    print(formatted_response + "\n")

                except Exception as e:
                    logging.error(f"Error processing message: {str(e)}")
                    print(f"\n{bot_name}: I apologize, but I encountered an error. Please try again.\n")

        except Exception as e:
            logging.error(f"Fatal error in chat session: {str(e)}")
            print(f"\n{bot_name}: I'm sorry, but I'm experiencing technical difficulties.\n")

if __name__ == "__main__":
    import asyncio
    try:
        bot = FRIDAY()
        asyncio.run(bot.chat())
    except Exception as e:
        logging.critical(f"Application failed to start: {str(e)}")