export type MemberRole = "ADMIN" | "MODERATOR" | "GUEST";
export type ChannelType = "TEXT" | "AUDIO" | "VIDEO";

export interface Server {
  id: string;
  name: string;
  imageUrl: string;
  imagePublicId: string;
  inviteCode: string;
  profileId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  userId: string;
  username: string;
  email?: string;
  imageUrl: string;
  imagePublicId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Member {
  id: string;
  role: MemberRole;
  profileId: string;
  serverId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  profileId: string;
  serverId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  memberOneId: string;
  memberTwoId: string;
  createdAt: Date;
  updatedAt: Date;
  directMessages: DirectMessage[];
}

export interface DirectMessage {
  id: string;
  content: string;
  imagePublicId: string | null;
  imageUrl: string | null;
  memberId: string;
  conversationId: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
}

export interface Message {
  id: string;
  content: string;
  imagePublicId: string | null;
  imageUrl: string | null;
  memberId: string;
  channelId: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationWithMembersWithProfile extends Conversation {
  memberOne: MemberWithProfile;
  memberTwo: MemberWithProfile;
}

export interface MemberWithProfile extends Member {
  profile: Profile;
}

export interface ServerWithChannels extends Server {
  channels: Channel[];
}

export interface ServerWithChannelsWithMembersWithProfiles extends Server {
  channels: Channel[];
  members: MemberWithProfile[];
}

export interface ServerWithMembersWithProfiles extends Server {
  members: MemberWithProfile[];
}

export interface ServerWithChannelsWithMembersWithProfiles extends Channel {
  members: MemberWithProfile[];
}

export interface MessageWithMemberWithProfile extends Message {
  member: MemberWithProfile;
}

export interface DirectMessageWithMemberWithProfile extends DirectMessage {}
