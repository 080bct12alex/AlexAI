import { useEffect, useRef, useState } from "react";
import "./newPrompt.css";
import Upload from "../upload/Upload";
import { IKImage } from "imagekitio-react";
import model from "../../lib/gemini";
import Markdown from "react-markdown";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const NewPrompt = ({ data }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {},
    selectedFile: null, // <== store raw file
  });

  const chat = model.startChat({
    history: data?.history?.map(({ role, parts }) => ({
      role,
      parts: [{ text: parts[0].text }],
    })),
    generationConfig: {},
  });

  const endRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [data, question, answer, img.dbData]);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ question, answer, imgPath }) => {
      return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${data._id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          answer,
          img: imgPath || undefined,
        }),
      }).then((res) => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", data._id] }).then(() => {
        formRef.current.reset();
        setQuestion("");
        setAnswer("");
        setImg({
          isLoading: false,
          error: "",
          dbData: {},
          aiData: {},
          selectedFile: null,
        });
      });
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const handleGemini = async (payload, text) => {
    try {
      const result = await chat.sendMessageStream(payload);
      let accumulatedText = "";
      for await (const chunk of result.stream) {
        accumulatedText += chunk.text();
        setAnswer(accumulatedText);
      }

      // If image is present, use its path
      const imgPath = img.dbData?.filePath || null;

      mutation.mutate({ question: text, answer: accumulatedText, imgPath });
    } catch (err) {
      console.error("Gemini error:", err);
    }
  };

  const add = async (text, isInitial) => {
    if (!isInitial) setQuestion(text);

    if (img.selectedFile && text) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result.split(",")[1];
        const mimeType = img.selectedFile.type;

        const inlineImage = {
          inlineData: {
            data: base64,
            mimeType,
          },
        };

        await handleGemini([inlineImage, text], text);
      };
      reader.readAsDataURL(img.selectedFile);
    } else {
      await handleGemini([text], text);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value;
    if (!text) return;
    add(text, false);
  };

  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current && data?.history?.length === 1) {
      add(data.history[0].parts[0].text, true);
      hasRun.current = true;
    }
  }, []);

  return (
    <>
      {img.isLoading && <div>Loading...</div>}
      {img.dbData?.filePath && (
        <IKImage
          urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
          path={img.dbData.filePath}
          width="380"
          transformation={[{ width: 380 }]}
        />
      )}
      {question && <div className="message user">{question}</div>}
      {answer && (
        <div className="message">
          <Markdown>{answer}</Markdown>
        </div>
      )}
      <div className="endChat" ref={endRef}></div>
      <form className="newForm" onSubmit={handleSubmit} ref={formRef}>
        <Upload setImg={setImg} />
        <input type="text" name="text" placeholder="Ask anything..." />
        <button type="submit">
          <img src="/arrow.png" alt="Send" />
        </button>
      </form>
    </>
  );
};

export default NewPrompt;
