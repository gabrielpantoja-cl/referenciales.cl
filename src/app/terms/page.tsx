/* app/terms/page.tsx */
import Footer from '@/components/ui/common/Footer';
import TimeStamp from '@/components/ui/common/TimeStamp';
import { promises as fs } from 'fs';
import path from 'path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkHtml from 'remark-html';

export default async function TermsPage() {
  const currentDate = new Date().toLocaleDateString('es-CL');

  // Leer archivo markdown
  const contentPath = path.join(process.cwd(), 'app/terms/content.md');
  const content = await fs.readFile(contentPath, 'utf8');

  // Convertir markdown a HTML
  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkHtml)
    .process(content);

  return (
    <main className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <TimeStamp date={currentDate} />

        {/* Contenido principal */}
        <div 
  className="markdown-content prose prose-slate max-w-none"
  dangerouslySetInnerHTML={{ __html: processedContent.toString() }}
        />

        <Footer />
      </div>
    </main>
  );
}