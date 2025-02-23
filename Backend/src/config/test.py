try:
    from src.utils.logger import logging  # Updated import path
except ImportError as e:
    print(f"Import Error: {e}")
    print("Make sure you have installed the package with: pip install -e .")
    raise

if __name__ == "__main__":
    logging.info("Logger test successful")
    print("Logger test successful")