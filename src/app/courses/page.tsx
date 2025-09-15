interface CoursesPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function CoursesPage({ searchParams }: CoursesPageProps) {
  const showSuccessBanner = searchParams.created === "1";

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Courses</h1>
        <a
          href="/courses/create"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Course
        </a>
      </div>

      {showSuccessBanner && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800">
            ✅ Course created successfully! Your course has been added.
          </p>
        </div>
      )}

      <div className="text-gray-600">
        <p>Course list functionality will be implemented here.</p>
        <p className="mt-2">
          <a href="/courses/create" className="text-blue-600 hover:underline">
            → Create another course
          </a>
        </p>
      </div>
    </div>
  );
}
