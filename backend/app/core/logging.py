import logging
import json
from datetime import datetime


class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "event_type": getattr(record, "event_type", "generic"),
            "user_id": getattr(record, "user_id", None),
            "role": getattr(record, "role", None),
            "action": getattr(record, "action", None),
            "message": record.getMessage(),
        }
        return json.dumps(log_record)


def get_logger(name: str):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())

    logger.addHandler(handler)
    return logger


# Example usage
logger = get_logger("library_hub")
logger.info("User login", extra={
            "event_type": "user_login", "user_id": "123", "role": "reader", "action": "login"})
