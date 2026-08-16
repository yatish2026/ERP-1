"use client";

import { useState, useEffect } from "react";
import { getAnnouncementsServer, createAnnouncementServer, deleteAnnouncementServer, Announcement } from "@/app/actions/announcements";
import { auth } from "@/lib/firebase/config";
import { Megaphone, Plus, Loader2, Trash2, Send } from "lucide-react";

export default function TeacherAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetAudience, setTargetAudience] = useState<"all" | "students">("all");
  
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAnnouncements = async () => {
    setLoading(true);
    const res = await getAnnouncementsServer("teacher");
    if (res.success) setAnnouncements(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setSuccess("");

    const user = auth.currentUser;
    if (!user) {
      setError("Not authenticated.");
      setCreating(false);
      return;
    }

    if (!title || !content) {
      setError("Please fill out all fields.");
      setCreating(false);
      return;
    }

    const res = await createAnnouncementServer(
      user.uid,
      user.displayName || "Teacher",
      "teacher",
      { title, content, targetAudience }
    );

    if (res.success) {
      setTitle("");
      setContent("");
      setTargetAudience("all");
      setSuccess("Announcement posted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await fetchAnnouncements();
    } else {
      setError(res.error || "Failed to post announcement.");
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    setDeletingId(id);
    const user = auth.currentUser;
    if (user) {
      const res = await deleteAnnouncementServer(user.uid, id, "teacher");
      if (res.success) {
        await fetchAnnouncements();
      } else {
        alert(res.error || "Failed to delete.");
      }
    }
    setDeletingId("");
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;
  }

  const currentUserUid = auth.currentUser?.uid;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Megaphone className="text-purple-500 w-8 h-8" /> 
          Announcements & Notice Board
        </h2>
        <p className="text-gray-600 mt-2">
          Read school notices or post updates for your students.
        </p>
      </header>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Plus className="text-blue-500 w-5 h-5" /> Post for Students
            </h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <select 
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:border-blue-500 transition-colors"
                >
                  <option value="all">Everyone (Public)</option>
                  <option value="students">Students Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Assignment Due Date"
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea 
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write your announcement here..."
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:border-blue-500 transition-colors resize-none"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={creating}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 font-medium flex justify-center items-center gap-2 transition-colors mt-6 shadow-sm disabled:opacity-50"
              >
                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {creating ? "Posting..." : "Post Announcement"}
              </button>
            </form>
          </div>
        </div>

        {/* Announcements Feed */}
        <div className="lg:col-span-2">
          {announcements.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
              <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg">No announcements posted yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map(post => (
                <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Posted by <span className="font-medium text-gray-700">{post.authorName}</span> on {new Date(post.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                      post.targetAudience === 'all' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      post.targetAudience === 'teachers' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                      'bg-green-50 text-green-700 border border-green-100'
                    }`}>
                      {post.targetAudience === 'all' ? 'Public' : post.targetAudience === 'teachers' ? 'Teachers' : 'Students'}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                  
                  {post.authorId === currentUserUid && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingId === post.id}
                      className="absolute top-6 right-20 text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      title="Delete Your Announcement"
                    >
                      {deletingId === post.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
