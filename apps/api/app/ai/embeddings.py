from sentence_transformers import SentenceTransformer
import numpy as np
import logging
from typing import List

logger = logging.getLogger(__name__)

class EmbeddingEngine:
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingEngine, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._model is None:
            logger.info("Initializing EmbeddingEngine (all-MiniLM-L6-v2)...")
            try:
                # all-MiniLM-L6-v2 produces 384-dimensional embeddings
                self._model = SentenceTransformer('all-MiniLM-L6-v2')
            except Exception as e:
                logger.error(f"Failed to load embedding model: {e}")
                raise

    def get_embedding(self, text: str) -> List[float]:
        """Generate a vector embedding for a single text string."""
        if not text:
            return [0.0] * 384
        try:
            # truncate to model max length (usually 512 tokens)
            embedding = self._model.encode(text[:5000])
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            return [0.0] * 384

    def batch_get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate vector embeddings for a batch of text strings."""
        try:
            embeddings = self._model.encode(texts)
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Batch embedding generation failed: {e}")
            return [[0.0] * 384 for _ in texts]

embedding_engine = EmbeddingEngine()
