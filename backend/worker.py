"""
Entry point for the RQ worker process.
Run with: python worker.py
"""
from redis import Redis
from rq import Worker, Queue
from app.core.config import settings

if __name__ == "__main__":
    redis_conn = Redis.from_url(settings.REDIS_URL)
    queue = Queue("homework", connection=redis_conn)
    worker = Worker([queue], connection=redis_conn)
    print(f"Starting RQ worker — listening on queue: homework")
    worker.work(with_scheduler=True)
