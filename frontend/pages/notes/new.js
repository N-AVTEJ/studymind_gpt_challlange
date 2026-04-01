import { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import api from "../../utils/api";

const SUBJECTS = ["General", "Mathematics", "Physics", "Chemistry", "Biology", "History", "English", "Computer Science", "Economics", "Other"];

export default function NewNote() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", content: "", subject: "General" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      const res = await api.post("/api/notes/", form);
      router.push(`/notes/${res.data.id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'doc'].includes(fileExtension)) {
      alert('Please upload a PDF or DOCX file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', form.subject);

    try {
      const res = await api.post("/api/notes/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      router.push(`/notes/${res.data.id}`);
    } catch (e) {
      console.error(e);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <Layout title="New Note">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="btn-ghost text-sm">← Back</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
            {saving ? "Saving…" : "Save note →"}
          </button>
        </div>

        <div className="card p-6 space-y-5">
          <div>
            <label className="label">Title</label>
            <input type="text" className="input text-base" placeholder="Note title…"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Subject</label>
            <select className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
          {/* File Upload Section */}
          <div>
            <label className="label">Or Import from File</label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <div className="text-gray-500">
                    {uploading ? (
                      <span>Processing file...</span>
                    ) : (
                      <>
                        <span className="text-2xl">📄</span>
                        <p className="text-sm">Drag and drop a PDF or DOCX file here, or click to browse</p>
                      </>
                    )}
                  </div>
                </div>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">Supported formats: PDF, DOCX, DOC</p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or write manually</span>
            </div>
          </div>

          <div>
            <label className="label">Content</label>
            <textarea className="input" rows={18} placeholder="Start writing your notes here…"
              style={{ resize: "vertical", lineHeight: 1.7 }}
              value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
