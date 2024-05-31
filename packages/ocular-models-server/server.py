
import torch
from torch.nn.functional import normalize
from transformers import AutoModel, AutoTokenizer
from fastapi import FastAPI
from typing import List
from pydantic import BaseModel

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using {device}")

model_id = "intfloat/e5-base-v2"

# initialize tokenizer and model
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModel.from_pretrained(model_id).to(device)
model.eval()

def embed(docs: list[str]) -> list[list[float]]:
    # tokenize
    tokens = tokenizer(
        docs, padding=True, max_length=512, truncation=True, return_tensors="pt"
    ).to(device)
    with torch.no_grad():
        # process with model for token-level embeddings
        out = model(**tokens)
        # mask padding tokens
        last_hidden = out.last_hidden_state.masked_fill(
            ~tokens["attention_mask"][..., None].bool(), 0.0
        )
        # create mean pooled embeddings
        doc_embeds = last_hidden.sum(dim=1) / \
            tokens["attention_mask"].sum(dim=1)[..., None]
    return doc_embeds.cpu().numpy().tolist()

app = FastAPI()

class Texts(BaseModel):
    texts: list = []

@app.post("/embed")
async def embed_api(texts: Texts):
    prefixed_texts = [f"passage: {d}" for d in texts.texts]
    texts_embeds = embed(prefixed_texts)
    return texts_embeds