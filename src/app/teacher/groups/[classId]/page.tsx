"use client";

import { useState, useEffect, use } from "react";
import { auth } from "@/lib/firebase/config";
import { getGroupPostsServer, createGroupPostServer, deleteGroupPostServer, GroupPost } from "@/app/actions/groups";
import { Loader2, ArrowLeft, Send, Trash2, FileText, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TeacherClassGroupPage({ params }: { params: Promise<{ classId: string }> }) {
  const resolvedParams = use(params);
  const classId = resolvedParams.classId;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [posts, setPosts] = useState<GroupPost[]>([]);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        setUserName(user.displayName || "Teacher");
        await fetchPosts();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [classId]);

  const fetchPosts = async () => {
    const res = await getGroupPostsServer(classId);
    if (res.success && res.data) {
      setPosts(res.data);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    setIsPosting(true);
    const res = await createGroupPostServer(userId, {
      classId,
      authorId: userId,
      authorName: userName,
      title: title.trim(),
      content: content.trim()
    });

    if (res.success && res.data) {
      setTitle("");
      setContent("");
      setPosts([res.data, ...posts]);
    } else {
      alert(res.error || "Failed to post.");
    }
    setIsPosting(false);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    
    const res = await deleteGroupPostServer(userId, postId);
    if (res.success) {
      setPosts(posts.filter(p => p.id !== postId));
    } else {
      alert(res.error || "Failed to delete post.");
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24">
      <Link href="/teacher/groups" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Groups
      </Link>

      <header className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Class {classId} Group</h2>
        <p className="text-gray-600 mt-2">Post assignments, homework, and study materials for your students.</p>
      </header>

      {/* Create Post Form */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 mb-8">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" /> Create New Assignment
        </h3>
        <form onSubmit={handleCreatePost} className="space-y-4">
          <input
            type="text"
            placeholder="Assignment Title (e.g. Chapter 4 Math Homework)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-colors font-medium text-gray-900"
            required
            disabled={isPosting}
          />
          <textarea
            placeholder="Detailed instructions or content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-colors min-h-[120px] resize-y text-gray-800"
            required
            disabled={isPosting}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPosting || !title.trim() || !content.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isPosting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {isPosting ? "Posting..." : "Post Assignment"}
            </button>
          </div>
        </form>
      </div>

      {/* Posts Feed */}
      <h3 className="font-bold text-gray-500 uppercase tracking-wider text-xs mb-4 ml-2">Recent Assignments</h3>
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="bg-gray-50 rounded-3xl p-12 text-center border border-gray-200 border-dashed">
            <p className="text-gray-500 font-medium">No assignments posted yet.</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative group">
              {post.authorId === userId && (
                <button 
                  onClick={() => handleDeletePost(post.id)}
                  className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors md:opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg"
                  title="Delete Post"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              
              <h4 className="text-xl font-bold text-gray-900 mb-2 pr-10">{post.title}</h4>
              <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-4 pb-4 border-b border-gray-50">
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{post.authorName}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
