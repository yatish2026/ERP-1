"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { getGroupPostsServer, GroupPost } from "@/app/actions/groups";
import { Loader2, FileText, Calendar, BookOpen } from "lucide-react";

export default function StudentClassGroupPage() {
  const [loading, setLoading] = useState(true);
  const [classId, setClassId] = useState("");
  const [posts, setPosts] = useState<GroupPost[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const uClassId = userDoc.data().classId;
          setClassId(uClassId || "");
          
          if (uClassId) {
            const res = await getGroupPostsServer(uClassId);
            if (res.success && res.data) {
              setPosts(res.data);
            }
          }
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;
  }

  if (!classId) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 p-6 rounded-full mb-4">
          <BookOpen className="text-red-500 w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Class Assigned</h2>
        <p className="text-gray-500">You have not been assigned to a class yet. Please contact administration.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24">
      <header className="mb-8 border-b pb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BookOpen className="text-blue-500 w-8 h-8" />
          Class {classId} Group
        </h2>
        <p className="text-gray-600 mt-2">View assignments, homework, and study materials posted by your teachers.</p>
      </header>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="bg-gray-50 rounded-3xl p-12 text-center border border-gray-200 border-dashed">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <FileText className="text-gray-400 w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Assignments Yet</h3>
            <p className="text-gray-500 font-medium max-w-sm mx-auto">Your teachers have not posted any homework or assignments to this group.</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h4 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h4>
              <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-4 pb-4 border-b border-gray-50">
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md flex items-center gap-1">
                  Teacher: {post.authorName}
                </span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
