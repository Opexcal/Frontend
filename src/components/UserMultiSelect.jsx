import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Replace the entire UserMultiSelect component with this improved version:
const UserMultiSelect = ({ 
  selectedUsers = [], 
  onChange, 
  placeholder = "Select users...",
  users = [],
  groupedByTeam = false // ✅ New prop
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSelect = (userId) => {
    const isSelected = selectedUsers.includes(userId);
    if (isSelected) {
      onChange(selectedUsers.filter(id => id !== userId));
    } else {
      onChange([...selectedUsers, userId]);
    }
  };

  const handleRemove = (userId, e) => {
    e?.stopPropagation(); // ✅ Prevent triggering parent click
    onChange(selectedUsers.filter(id => id !== userId));
  };

  const selectedUserObjects = users.filter(u => 
    selectedUsers.includes(u._id || u.id)
  );

  // ✅ Filter users by search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10"
          >
            <span className="truncate">
              {selectedUsers.length > 0 
                ? `${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''} selected`
                : placeholder
              }
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search users..." 
              value={search}
              onValueChange={setSearch}
            />
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {filteredUsers.map((user) => (
                <CommandItem
                  key={user._id || user.id}
                  value={user.name}
                  onSelect={() => handleSelect(user._id || user.id)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedUsers.includes(user._id || user.id) 
                        ? "opacity-100" 
                        : "opacity-0"
                    )}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {user.role}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* ✅ Improved selected users display */}
      {selectedUserObjects.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-muted/50">
          {selectedUserObjects.map((user) => (
            <Badge 
              key={user._id || user.id} 
              variant="secondary" 
              className="gap-1 pr-1"
            >
              <span className="text-xs">{user.name}</span>
              <button
                onClick={(e) => handleRemove(user._id || user.id, e)}
                className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserMultiSelect;