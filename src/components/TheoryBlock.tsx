import ReactMarkdown from 'react-markdown';

interface Props {
  content: string;
}

export default function TheoryBlock({ content }: Props) {
  return (
    <div className="prose prose-sm text-justify">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
