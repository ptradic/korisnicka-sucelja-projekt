import Link from "next/link";

type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

async function getPosts() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
    // Use Next.js 15 cache option
    cache: "no-store", // or 'force-cache' for static generation
  });

  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }

  return res.json();
}

export default async function PostsPage() {
  const posts: Post[] = await getPosts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20 md:pt-20 px-4 pb-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Blog Posts</h1>
          <p className="text-gray-600">
            Explore our collection of {posts.length} articles
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-200"
            >
              <div className="mb-3">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full">
                  Post #{post.id}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 capitalize">
                {post.title}
              </h2>
              <p className="text-gray-600 text-sm line-clamp-3">{post.body}</p>
              <div className="mt-4 flex items-center text-indigo-600 font-medium text-sm">
                Read more
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
