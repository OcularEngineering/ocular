import { AutoTokenizer, AutoModelForSeq2SeqLM } from "@xenova/transformers";
import {express} from  "express";

async function loadModel(modelName) {
  const tokenizer = await AutoTokenizer.fromPretrained(modelName);
  return tokenizer
}

// Load the models and tokenizers for each supported language
const embedding_model = loadModel('models/intfloat/e5-base-v2')

const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const supportedTranslations = ["en_fr", "fr_en"];

app.post("/embed", async (req, res) => {
  embeddings = model.encode(req.text)
  return embeddings
});

app.listen(6000, "0.0.0.0", () => {
  console.log("Embedding Server is running on port 6000");
});
