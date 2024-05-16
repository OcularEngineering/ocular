import { AutoTokenizer} from "@xenova/transformers";
import express from  "express";
import bodyParser from "body-parser";

async function loadModel(modelName) {
  const tokenizer = await AutoTokenizer.from_pretrained(modelName);
  return tokenizer
}

// Load the models and tokenizers for each supported language
const embedding_model = await loadModel('intfloat/e5-base-v2')

const app = express();
app.use(bodyParser.json());

app.post("/embed", async (req, res) => {
  console.log("Received request to embed text: ", req.body.text);
  const embeddings = await embedding_model.encode(req.body.text)
  console.log("Embeddings: ", embeddings);
  res.send({embeddings:embeddings}) 
});

app.listen(6000, "0.0.0.0", () => {
  console.log("Embedding Server is running on port 6000");
});
