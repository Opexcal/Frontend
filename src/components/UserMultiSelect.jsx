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

const UserMultiSelect = ({ 
  selectedUsers = [], 
  onChange, 
  placeholder = "Select users...",
  users = []
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (userId) => {
    const isSelected = selectedUsers.includes(userId);
    if (isSelected) {
      onChange(selectedUsers.filter(id => id !== userId));
    } else {
      onChange([...selectedUsers, userId]);
    }
  };

  const handleRemove = (userId) => {
    onChange(selectedUsers.filter(id => id !== userId));
  };

  const selectedUserObjects = users.filter(u => selectedUsers.includes(u._id));

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedUsers.length > 0 
              ? `${selectedUsers.length} user(s) selected`
              : placeholder
            }
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search users..." />
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {users.map((user) => (
                <CommandItem
                  key={user._id}
                  value={user._id}
                  onSelect={() => handleSelect(user._id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedUsers.includes(user._id) 
                        ? "opacity-100" 
                        : "opacity-0"
                    )}
                  />
                  {user.name} ({user.role})
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected users badges */}
      {selectedUserObjects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUserObjects.map((user) => (
            <Badge key={user._id} variant="secondary" className="gap-1">
              {user.name}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => handleRemove(user._id)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserMultiSelect;