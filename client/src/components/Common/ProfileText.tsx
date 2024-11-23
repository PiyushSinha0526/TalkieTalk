import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfileText = ({
  avatar,
  primaryText,
  secondaryText,
}: {
  avatar: string;
  primaryText: string;
  secondaryText?: string;
}) => {
  return (
    <>
      <Avatar>
        <AvatarImage src={avatar} alt={primaryText} />
        <AvatarFallback className="text-foreground">
          {primaryText[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="font-semibold">{primaryText}</div>
        <div className="text-sm text-muted-foreground">{secondaryText}</div>
      </div>
    </>
  );
};

export default ProfileText;
