import { notFound } from 'next/navigation';
import { aptitudeData } from '@/constants/aptitude';
import AptitudeQuiz from '@/components/AptitudeQuiz';

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const categoryId = resolvedParams.category;
  const categoryData = aptitudeData[categoryId];

  if (!categoryData) {
    return notFound();
  }

  return (
    <div className="min-h-[calc(100vh-100px)] h-full flex flex-col">
      <AptitudeQuiz category={categoryData} />
    </div>
  );
}
