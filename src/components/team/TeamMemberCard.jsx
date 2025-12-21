import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * TeamMemberCard - Display team member info with task statistics
 */
const TeamMemberCard = ({
  member,
  taskCount = 0,
  completedCount = 0,
  overdueCount = 0,
  onClick,
  className = "",
}) => {
  const navigate = useNavigate();
  const completionRate =
    taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  const handleClick = () => {
    if (onClick) {
      onClick(member);
    } else {
      navigate(`/team/tasks?assignee=${member.id}`);
    }
  };

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer hover:shadow-md transition-shadow hover:border-primary/50",
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary text-white">
            {member.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{member.name}</h3>
          <p className="text-xs text-muted-foreground truncate">
            {member.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-blue-50 rounded p-2">
          <div className="text-gray-600">Tasks</div>
          <div className="font-semibold text-blue-600">{taskCount}</div>
        </div>
        <div className="bg-green-50 rounded p-2">
          <div className="text-gray-600">Done</div>
          <div className="font-semibold text-green-600">{completedCount}</div>
        </div>
        <div className="bg-red-50 rounded p-2">
          <div className="text-gray-600">Overdue</div>
          <div className="font-semibold text-red-600">{overdueCount}</div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Completion Rate</span>
          <span className="font-semibold">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
          <div
            className="bg-green-600 h-1.5 rounded-full transition-all"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </Card>
  );
};

export default TeamMemberCard;
