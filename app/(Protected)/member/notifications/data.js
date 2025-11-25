// app/notifications/data.js

import {
  Heart,
  MessageCircle,
  Users,
  Calendar,
  UserPlus,
  Repeat2,
  Mail,
} from "lucide-react";

// ----------------------------
// ICON MAP
// ----------------------------
export const getNotificationIcon = (type) => {
  switch (type) {
    case "like":
      return <Heart className="h-5 w-5 text-red-500 fill-red-500" />;
    case "comment":
    case "reply":
      return <MessageCircle className="h-5 w-5 text-primary" />;
    case "follow":
      return <UserPlus className="h-5 w-5 text-accent" />;
    case "mention":
      return <Users className="h-5 w-5 text-secondary" />;
    case "event":
      return <Calendar className="h-5 w-5 text-primary" />;
    case "message":
      return <Mail className="h-5 w-5 text-accent" />;
    case "repost":
      return <Repeat2 className="h-5 w-5 text-accent" />;
    default:
      return null;
  }
};
