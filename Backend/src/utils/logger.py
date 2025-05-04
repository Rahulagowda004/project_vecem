import logging
import os
from datetime import datetime

# Create a logs directory at the root level if it doesn't exist
logs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "logs")
os.makedirs(logs_dir, exist_ok=True)

# Generate a log file name with timestamp
LOG_FILE = f"{datetime.now().strftime('%m_%d_%Y_%H_%M_%S')}.log"
LOG_FILE_PATH = os.path.join(logs_dir, LOG_FILE)

# Configure logging
logging.basicConfig(
    filename=LOG_FILE_PATH,
    format="[ %(asctime)s ] %(lineno)d %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)

# Add console handler to see logs in the console as well
console_handler = logging.StreamHandler()
console_handler.setFormatter(logging.Formatter("[ %(asctime)s ] %(lineno)d %(name)s - %(levelname)s - %(message)s"))
logging.getLogger().addHandler(console_handler)