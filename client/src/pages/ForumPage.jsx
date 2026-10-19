import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Users,
  MessageCircle,
  ThumbsUp,
  Plus,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Share2,
  User,
  Trash2,
  Edit3,
  Flag,
  Award,
  ChevronLeft,
  ChevronRight,
  CornerDownRight,
  X,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Crop Diseases',
  'Flower Diseases',
  'Plant Care',
  'Nutrient Deficiency',
  'Disease Prevention',
  'Recovery Experiences',
  'General Discussion'
];

const ForumPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [reportingPost, setReportingPost] = useState(null);
  const [reportReason, setReportReason] = useState('Spam or Advertising');
  const [reportDetails, setReportDetails] = useState('');

  // New/Edit post form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postCat, setPostCat] = useState('Crop Diseases');
  const [plantType, setPlantType] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [selectedDetectionId, setSelectedDetectionId] = useState('');

  // Comments state
  const [commentText, setCommentText] = useState({});
  const [replyingTo, setReplyingTo] = useState({});

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/community/posts', {
        params: {
          category: category === 'All' ? undefined : category,
          search: search.trim() || undefined,
          sort,
          page,
          limit: 10
        }
      });
      if (res.data.success) {
        setPosts(res.data.posts || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalPosts(res.data.total || (res.data.posts || []).length);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/detections/history');
      if (res.data.success) {
        setHistoryList(res.data.detections || []);
      }
    } catch (err) {
      console.warn('Could not load user detection history for linking:', err.message);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [category, sort, page]);

  useEffect(() => {
    fetchHistory();
  }, [isAuthenticated]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  const handleUpvote = async (postId) => {
    if (!isAuthenticated) {
      alert('Please log in to react to discussions.');
      return;
    }
    try {
      const res = await api.post(`/community/posts/${postId}/upvote`);
      if (res.data.success) {
        setPosts(prev =>
          prev.map(p =>
            p._id === postId
              ? {
                  ...p,
                  helpfulCount: res.data.helpfulCount,
                  upvotes: res.data.reacted
                    ? [...(p.upvotes || []), user._id]
                    : (p.upvotes || []).filter(id => id !== user._id)
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (postId, parentCommentId = null) => {
    if (!isAuthenticated) {
      alert('Please log in to participate in discussion threads.');
      return;
    }
    const key = parentCommentId ? `${postId}-${parentCommentId}` : postId;
    const text = commentText[key];
    if (!text || !text.trim()) return;

    try {
      const res = await api.post(`/community/posts/${postId}/comments`, {
        text: text.trim(),
        parentCommentId
      });
      if (res.data.success) {
        setCommentText({ ...commentText, [key]: '' });
        setReplyingTo({ ...replyingTo, [parentCommentId]: false });
        fetchPosts();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const res = await api.delete(`/community/comments/${commentId}`);
      if (res.data.success) {
        fetchPosts();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete comment.');
    }
  };

  const handleAcceptAnswer = async (postId, commentId) => {
    if (!isAuthenticated) return;
    try {
      const res = await api.patch(`/community/posts/${postId}/accept-answer/${commentId}`);
      if (res.data.success) {
        fetchPosts();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark accepted answer.');
    }
  };

  const handleToggleSolved = async (postId) => {
    if (!isAuthenticated) return;
    try {
      const res = await api.patch(`/community/posts/${postId}/solve`);
      if (res.data.success) {
        fetchPosts();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update solved status.');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this discussion post?')) return;
    try {
      const res = await api.delete(`/community/posts/${postId}`);
      if (res.data.success) {
        setPosts(prev => prev.filter(p => p._id !== postId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post.');
    }
  };

  const handleOpenEdit = (post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setPostCat(post.category);
    setPlantType(post.plantType || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/community/posts/${editingPost._id}`, {
        title,
        content,
        category: postCat,
        plantType
      });
      if (res.data.success) {
        setEditingPost(null);
        fetchPosts();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update post.');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to create a discussion post.');
      return;
    }

    const fd = new FormData();
    fd.append('title', title);
    fd.append('content', content);
    fd.append('category', postCat);
    if (plantType) fd.append('plantType', plantType);
    if (selectedDetectionId) fd.append('detectionRef', selectedDetectionId);
    if (imageFile) fd.append('image', imageFile);

    try {
      const res = await api.post('/community/posts', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setShowCreateModal(false);
        setTitle('');
        setContent('');
        setPlantType('');
        setImageFile(null);
        setSelectedDetectionId('');
        setPage(1);
        fetchPosts();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create post');
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/community/reports', {
        targetType: 'post',
        targetId: reportingPost._id,
        reason: reportReason,
        details: reportDetails
      });
      if (res.data.success) {
        alert('Thank you. The post has been flagged for agricultural moderator review.');
        setReportingPost(null);
        setReportDetails('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit report');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-agro-50 dark:bg-agro-950 border border-agro-200 dark:border-agro-800 text-agro-800 dark:text-agro-200 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5 text-agro-600 dark:text-agro-400" />
            <span>Grower Peer Network &amp; Expert Discussions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('community')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Collaborate with verified agronomists, horticulturists, and fellow farmers. Share clinical disease 
            observations, organic biological remedies, and foliar recovery experiences.
          </p>
        </div>

        <button
          onClick={() => {
            if (!isAuthenticated) {
              alert('Please log in to create a discussion post.');
              return;
            }
            setShowCreateModal(true);
          }}
          className="self-start sm:self-center px-4 py-2.5 bg-agro-700 hover:bg-agro-800 text-white rounded-2xl text-xs font-bold shadow-md shadow-agro-700/20 flex items-center space-x-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Discussion Post</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-5 space-y-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search discussions by crop, disease, or symptom..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-agro-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="helpful">Sort: Most Helpful</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold transition"
            >
              Search
            </button>
          </div>
        </form>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                category === cat
                  ? 'bg-agro-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Discussions ({totalPosts})
          </span>
          {totalPages > 1 && (
            <span className="text-xs text-slate-400">
              Page {page} of {totalPages}
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
            Loading discussions...
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
            <AlertCircle className="w-6 h-6 mx-auto text-amber-500 opacity-60" />
            <p>No community posts found in this category. Be the first to start a conversation!</p>
          </div>
        ) : (
          posts.map((post) => {
            const isAuthor = user && post.author && user._id === post.author._id;
            const isStaff = user && ['admin', 'moderator'].includes(user.role);
            const isUserReacted = user && (post.upvotes || []).includes(user._id);

            // Separate root comments and nested replies
            const rootComments = (post.comments || []).filter(c => !c.parentCommentId);
            const getReplies = (parentId) => (post.comments || []).filter(c => c.parentCommentId && c.parentCommentId.toString() === parentId.toString());

            return (
              <div
                key={post._id}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-6 space-y-4 shadow-xs transition"
              >
                {/* Author & Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-agro-700 text-white flex items-center justify-center font-bold text-xs">
                      {post.author?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{post.author?.name}</span>
                        {post.author?.role === 'expert' && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-extrabold uppercase">
                            Agronomist
                          </span>
                        )}
                        {['admin', 'moderator'].includes(post.author?.role) && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[9px] font-extrabold uppercase">
                            Staff
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {post.author?.farmLocation || 'Field Location'} &bull; {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {post.isSolved && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Solved</span>
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                      {post.category}
                    </span>

                    {/* Options: Edit, Delete, Report */}
                    {isAuthor && (
                      <button
                        onClick={() => handleOpenEdit(post)}
                        className="p-1 rounded text-slate-400 hover:text-agro-700"
                        title="Edit Post"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {(isAuthor || isStaff) && (
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="p-1 rounded text-slate-400 hover:text-red-600"
                        title="Delete Post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {!isAuthor && (
                      <button
                        onClick={() => setReportingPost(post)}
                        className="p-1 rounded text-slate-300 hover:text-amber-600"
                        title="Report Inappropriate Content"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title & Content */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{post.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Attached Detection Info if Linked */}
                {post.detectionRef && (
                  <div className="p-3 rounded-2xl bg-agro-50/50 dark:bg-agro-950/20 border border-agro-200/60 dark:border-agro-900/40 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-agro-600" />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          Linked Specimen: {post.detectionRef.plantName} — {post.detectionRef.primaryDisease}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          AI Prediction Confidence: {Number(post.detectionRef.confidence || 0).toFixed(1)}% &bull; [Decision Support Only]
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Attached Plant Leaf Image */}
                {post.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-80 bg-slate-100 dark:bg-slate-900">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover max-h-80"
                    />
                  </div>
                )}

                {/* Post Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400">
                  <button
                    onClick={() => handleUpvote(post._id)}
                    className={`flex items-center space-x-1.5 font-semibold transition ${
                      isUserReacted ? 'text-agro-700 dark:text-agro-400 font-bold' : 'hover:text-agro-700'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${isUserReacted ? 'fill-current' : ''}`} />
                    <span>{post.helpfulCount || post.upvotes?.length || 0} Helpful</span>
                  </button>

                  <div className="flex items-center space-x-3">
                    {(isAuthor || (user && user.role === 'expert')) && (
                      <button
                        onClick={() => handleToggleSolved(post._id)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 flex items-center space-x-1 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{post.isSolved ? 'Reopen Discussion' : 'Mark as Solved'}</span>
                      </button>
                    )}

                    <div className="flex items-center space-x-1 text-slate-400">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments?.length || 0} Comments</span>
                    </div>
                  </div>
                </div>

                {/* Nested Comments & Replies Thread */}
                {rootComments.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-900/40 p-4 rounded-2xl">
                    {rootComments.map((cm) => {
                      const replies = getReplies(cm._id);
                      const isCmAuthor = user && cm.user && user._id === cm.user._id;
                      const replyKey = `${post._id}-${cm._id}`;

                      return (
                        <div key={cm._id} className="space-y-2 border-b border-slate-100 dark:border-slate-800/60 pb-3 last:border-none last:pb-0">
                          
                          {/* Root Comment */}
                          <div className={`p-2.5 rounded-xl transition ${cm.isAccepted ? 'bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50' : ''}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                  {cm.user?.name || 'Farmer'}
                                </span>
                                {cm.user?.role === 'expert' && (
                                  <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded">
                                    Agronomist
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400">
                                  {new Date(cm.createdAt).toLocaleDateString()}
                                </span>
                              </div>

                              <div className="flex items-center space-x-1.5">
                                {cm.isAccepted && (
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                                    <Award className="w-3 h-3 text-amber-600" />
                                    <span>Accepted Answer</span>
                                  </span>
                                )}

                                {isAuthor && (
                                  <button
                                    onClick={() => handleAcceptAnswer(post._id, cm._id)}
                                    className="text-[10px] text-agro-700 dark:text-agro-400 font-bold hover:underline"
                                  >
                                    {cm.isAccepted ? 'Unmark' : 'Accept Answer'}
                                  </button>
                                )}

                                {(isCmAuthor || isAuthor || isStaff) && (
                                  <button
                                    onClick={() => handleDeleteComment(cm._id)}
                                    className="text-slate-400 hover:text-red-500 p-0.5"
                                    title="Delete Comment"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <p className="text-slate-700 dark:text-slate-300 text-xs mt-1 leading-relaxed">
                              {cm.text}
                            </p>

                            <button
                              onClick={() => setReplyingTo({ ...replyingTo, [cm._id]: !replyingTo[cm._id] })}
                              className="text-[10px] text-slate-400 hover:text-agro-600 font-semibold mt-1 flex items-center space-x-1"
                            >
                              <CornerDownRight className="w-2.5 h-2.5" />
                              <span>Reply</span>
                            </button>
                          </div>

                          {/* Nested Replies */}
                          {replies.length > 0 && (
                            <div className="pl-6 space-y-2 border-l-2 border-slate-200 dark:border-slate-700 ml-2">
                              {replies.map(rep => {
                                const isRepAuthor = user && rep.user && user._id === rep.user._id;
                                return (
                                  <div key={rep._id} className="text-xs bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200">{rep.user?.name}</span>
                                        <span className="text-[9px] text-slate-400">{new Date(rep.createdAt).toLocaleDateString()}</span>
                                      </div>
                                      {(isRepAuthor || isAuthor || isStaff) && (
                                        <button
                                          onClick={() => handleDeleteComment(rep._id)}
                                          className="text-slate-400 hover:text-red-500 p-0.5"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{rep.text}</p>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Inline Reply Input */}
                          {replyingTo[cm._id] && (
                            <div className="pl-6 flex items-center space-x-2 pt-1">
                              <input
                                type="text"
                                value={commentText[replyKey] || ''}
                                onChange={(e) => setCommentText({ ...commentText, [replyKey]: e.target.value })}
                                placeholder={`Reply to ${cm.user?.name}...`}
                                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-agro-500"
                              />
                              <button
                                onClick={() => handleAddComment(post._id, cm._id)}
                                className="px-3 py-1.5 bg-agro-700 text-white text-xs font-semibold rounded-xl hover:bg-agro-800 transition"
                              >
                                Send
                              </button>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add Root Comment Input */}
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    value={commentText[post._id] || ''}
                    onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                    placeholder="Write a recommendation or clinical reply..."
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-agro-500"
                  />
                  <button
                    onClick={() => handleAddComment(post._id)}
                    className="px-4 py-2 bg-slate-900 hover:bg-black dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold rounded-xl transition"
                  >
                    Reply
                  </button>
                </div>

              </div>
            );
          })
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* New Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Start a Community Discussion</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Discussion Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Effective bio-fungicides for Apple Powdery Mildew?"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-agro-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                  <select
                    value={postCat}
                    onChange={(e) => setPostCat(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Crop / Flower Name</label>
                  <input
                    type="text"
                    value={plantType}
                    onChange={(e) => setPlantType(e.target.value)}
                    placeholder="e.g. Tomato, Rose, Potato"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-agro-500"
                  />
                </div>
              </div>

              {/* Link Detection Option */}
              {historyList.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center space-x-1">
                    <LinkIcon className="w-3.5 h-3.5 text-agro-600" />
                    <span>Link Past AI Diagnosis (Optional)</span>
                  </label>
                  <select
                    value={selectedDetectionId}
                    onChange={(e) => setSelectedDetectionId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                  >
                    <option value="">Do not attach diagnosis</option>
                    {historyList.map(h => (
                      <option key={h._id} value={h._id}>
                        {h.plantName} — {h.primaryDisease} ({Number(h.confidence || 0).toFixed(1)}%) &bull; {new Date(h.createdAt).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Foliar Observations &amp; Questions</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe foliar symptoms, soil moisture conditions, organic remedies tried, or questions for agronomists..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-agro-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Attach Leaf Photograph (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="text-xs text-slate-500 dark:text-slate-400"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-agro-700 hover:bg-agro-800 text-white rounded-xl text-xs font-semibold transition shadow-xs"
                >
                  Publish Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Discussion Post</h3>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Content</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-agro-700 text-white rounded-xl text-xs font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportingPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Report Discussion Post</h3>
            <form onSubmit={handleReportSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Reason for Report</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                >
                  <option value="Spam or Advertising">Spam or Advertising</option>
                  <option value="Inappropriate Content">Inappropriate Content</option>
                  <option value="Misleading Agricultural Advice">Misleading Agricultural Advice</option>
                  <option value="Harassment or Hate Speech">Harassment or Hate Speech</option>
                  <option value="Copyright Violation">Copyright Violation</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Details (Optional)</label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Explain why this content violates community agricultural guidelines..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportingPost(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ForumPage;
