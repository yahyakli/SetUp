import { USERS_SERVICE_URL } from "@/constants/API_URLS";
import Image from "next/image";
import { User } from "@/types/index";

interface UserAvatarProps {
    user: User | null;
    profile?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, profile = false }) => {
    const sizeClass = profile ? "w-40 h-40" : "w-8 h-8";
    const fontSize = profile ? "text-6xl" : "text-xs";

    return (
        <div>
            {user?.avatar ? (
                <div className={`rounded-full overflow-hidden ${sizeClass}`}>
                    <Image
                        src={`${USERS_SERVICE_URL}${user.avatar}`}
                        alt="User Avatar"
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div
                    className={`bg-gray-400 text-black rounded-full flex items-center justify-center px-2 ${sizeClass}`}
                >
                    <span className={fontSize}>
                        {user?.lastName?.charAt(0)?.toUpperCase()}
                        {user?.firstName?.charAt(0)?.toUpperCase()}
                    </span>
                </div>
            )}
        </div>
    );
};

export default UserAvatar;
