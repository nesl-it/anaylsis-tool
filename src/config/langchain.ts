import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export const generateTextEmbeddings = async (text: string) => {
  let embeddings = await new OpenAIEmbeddings().embedQuery(text);
  return embeddings;
};
