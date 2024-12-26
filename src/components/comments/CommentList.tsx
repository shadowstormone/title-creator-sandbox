import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Trash, Edit } from "lucide-react";
import { Comment, User } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

interface CommentListProps {
  animeId: number;
  comments: Comment[];
  onAddComment: (content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onEditComment: (commentId: string, content: string) => void;
  onLikeComment: (commentId: string) => void;
  onDislikeComment: (commentId: string) => void;
}

const CommentList = ({
  animeId,
  comments,
  onAddComment,
  onDeleteComment,
  onEditComment,
  onLikeComment,
  onDislikeComment,
}: CommentListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Необходимо войти в систему чтобы оставлять комментарии",
        variant: "destructive",
      });
      return;
    }
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment("");
    }
  };

  const canModerateComments = (user: User | null) => {
    if (!user) return false;
    return ["creator", "admin", "moderator"].includes(user.role);
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const submitEdit = (commentId: string) => {
    if (editContent.trim()) {
      onEditComment(commentId, editContent);
      setEditingId(null);
      setEditContent("");
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Оставьте комментарий..."
          className="min-h-[100px] bg-gray-800 text-white border-gray-700"
        />
        <Button type="submit" disabled={!user}>
          Отправить
        </Button>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback>{user?.username?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{user?.username}</p>
                    <p className="text-sm text-gray-400">{user?.role}</p>
                  </div>
                  <p className="text-sm text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                {editingId === comment.id ? (
                  <div className="mt-2 space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="bg-gray-700 text-white border-gray-600"
                    />
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => submitEdit(comment.id)}>
                        Сохранить
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Отмена
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-gray-300">{comment.content}</p>
                )}

                <div className="mt-4 flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLikeComment(comment.id)}
                    disabled={!user}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {comment.likes.length}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDislikeComment(comment.id)}
                    disabled={!user}
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    {comment.dislikes.length}
                  </Button>
                  
                  {(user?.id === comment.userId || canModerateComments(user)) && (
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(comment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteComment(comment.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentList;