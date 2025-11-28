'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  verification_level?: number;
}

interface Channel {
  id: string;
  name: string;
  type: number;
  position: number;
}

interface Role {
  id: string;
  name: string;
  color: number;
  position: number;
  permissions: string;
}

interface Message {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar: string | null;
    discriminator: string;
  };
  timestamp: string;
}

interface Member {
  user: {
    id: string;
    username: string;
    avatar: string | null;
    discriminator: string;
  };
  roles: string[];
  joined_at: string;
}

interface Webhook {
  id: string;
  name: string;
  channel_id: string;
  token: string;
  url: string;
}

type ViewTab = 'messages' | 'members' | 'settings' | 'webhooks';

export default function Dashboard() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>('messages');

  // Messages
  const [messages, setMessages] = useState<Message[]>([]);

  // Members
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Webhooks
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [newWebhookName, setNewWebhookName] = useState('');
  const [showCreateWebhook, setShowCreateWebhook] = useState(false);

  // Server settings
  const [guildSettings, setGuildSettings] = useState<Guild | null>(null);
  const [newServerName, setNewServerName] = useState('');

  // New channel/role form states
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState(0);
  const [newRoleName, setNewRoleName] = useState('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('bot_token');
    if (!storedToken) {
      router.push('/');
      return;
    }
    setToken(storedToken);
    loadGuilds(storedToken);
  }, [router]);

  const loadGuilds = async (botToken: string) => {
    try {
      const res = await fetch('/api/guilds', {
        headers: { 'Authorization': `Bot ${botToken}` },
      });
      const data = await res.json();
      setGuilds(data.guilds || []);
    } catch (error) {
      console.error('Failed to load guilds:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectGuild = async (guild: Guild) => {
    setSelectedGuild(guild);
    setSelectedChannel(null);
    setLoading(true);

    try {
      const [channelsRes, rolesRes, membersRes, settingsRes] = await Promise.all([
        fetch(`/api/channels?guildId=${guild.id}`, {
          headers: { 'Authorization': `Bot ${token}` },
        }),
        fetch(`/api/roles?guildId=${guild.id}`, {
          headers: { 'Authorization': `Bot ${token}` },
        }),
        fetch(`/api/members?guildId=${guild.id}`, {
          headers: { 'Authorization': `Bot ${token}` },
        }),
        fetch(`/api/guild-settings?guildId=${guild.id}`, {
          headers: { 'Authorization': `Bot ${token}` },
        }),
      ]);

      const channelsData = await channelsRes.json();
      const rolesData = await rolesRes.json();
      const membersData = await membersRes.json();
      const settingsData = await settingsRes.json();

      setChannels(channelsData.channels || []);
      setRoles(rolesData.roles || []);
      setMembers(membersData.members || []);
      setGuildSettings(settingsData.guild || null);
      setNewServerName(settingsData.guild?.name || '');
    } catch (error) {
      console.error('Failed to load guild data:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectChannel = async (channel: Channel) => {
    setSelectedChannel(channel);
    if (channel.type === 0) {
      loadMessages(channel.id);
      loadWebhooks(channel.id);
    }
  };

  const loadMessages = async (channelId: string) => {
    try {
      const res = await fetch(`/api/messages?channelId=${channelId}&limit=50`, {
        headers: { 'Authorization': `Bot ${token}` },
      });
      const data = await res.json();
      setMessages((data.messages || []).reverse());
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const loadWebhooks = async (channelId: string) => {
    try {
      const res = await fetch(`/api/webhooks?channelId=${channelId}`, {
        headers: { 'Authorization': `Bot ${token}` },
      });
      const data = await res.json();
      setWebhooks(data.webhooks || []);
    } catch (error) {
      console.error('Failed to load webhooks:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedChannel || !message.trim()) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelId: selectedChannel.id,
          content: message,
        }),
      });

      if (res.ok) {
        setMessage('');
        loadMessages(selectedChannel.id);
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      alert('Error sending message');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteChannel = async (channelId: string) => {
    if (!confirm('Are you sure you want to delete this channel?')) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/delete-channel', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bot ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channelId }),
      });

      if (res.ok) {
        setChannels(channels.filter(c => c.id !== channelId));
        if (selectedChannel?.id === channelId) {
          setSelectedChannel(null);
        }
        alert('Channel deleted successfully!');
      } else {
        alert('Failed to delete channel');
      }
    } catch (error) {
      alert('Error deleting channel');
    } finally {
      setActionLoading(false);
    }
  };

  const createChannel = async () => {
    if (!selectedGuild || !newChannelName.trim()) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/create-channel', {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guildId: selectedGuild.id,
          name: newChannelName,
          type: newChannelType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChannels([...channels, data.channel]);
        setNewChannelName('');
        setShowCreateChannel(false);
        alert('Channel created successfully!');
      } else {
        alert('Failed to create channel');
      }
    } catch (error) {
      alert('Error creating channel');
    } finally {
      setActionLoading(false);
    }
  };

  const createRole = async () => {
    if (!selectedGuild || !newRoleName.trim()) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/create-role', {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guildId: selectedGuild.id,
          name: newRoleName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRoles([...roles, data.role]);
        setNewRoleName('');
        setShowCreateRole(false);
        alert('Role created successfully!');
      } else {
        alert('Failed to create role');
      }
    } catch (error) {
      alert('Error creating role');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/delete-role', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bot ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guildId: selectedGuild?.id,
          roleId
        }),
      });

      if (res.ok) {
        setRoles(roles.filter(r => r.id !== roleId));
        alert('Role deleted successfully!');
      } else {
        alert('Failed to delete role');
      }
    } catch (error) {
      alert('Error deleting role');
    } finally {
      setActionLoading(false);
    }
  };

  const kickMember = async (userId: string) => {
    if (!confirm('Are you sure you want to kick this member?')) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/kick-member', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bot ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guildId: selectedGuild?.id,
          userId,
        }),
      });

      if (res.ok) {
        setMembers(members.filter(m => m.user.id !== userId));
        alert('Member kicked successfully!');
      } else {
        alert('Failed to kick member');
      }
    } catch (error) {
      alert('Error kicking member');
    } finally {
      setActionLoading(false);
    }
  };

  const banMember = async (userId: string) => {
    if (!confirm('Are you sure you want to ban this member?')) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/ban-member', {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guildId: selectedGuild?.id,
          userId,
        }),
      });

      if (res.ok) {
        setMembers(members.filter(m => m.user.id !== userId));
        alert('Member banned successfully!');
      } else {
        alert('Failed to ban member');
      }
    } catch (error) {
      alert('Error banning member');
    } finally {
      setActionLoading(false);
    }
  };

  const assignRole = async (userId: string, roleId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/assign-role', {
        method: 'PUT',
        headers: {
          'Authorization': `Bot ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guildId: selectedGuild?.id,
          userId,
          roleId,
        }),
      });

      if (res.ok) {
        // Update member roles locally
        setMembers(members.map(m =>
          m.user.id === userId
            ? { ...m, roles: [...m.roles, roleId] }
            : m
        ));
        alert('Role assigned successfully!');
      } else {
        alert('Failed to assign role');
      }
    } catch (error) {
      alert('Error assigning role');
    } finally {
      setActionLoading(false);
    }
  };

  const createWebhook = async () => {
    if (!selectedChannel || !newWebhookName.trim()) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelId: selectedChannel.id,
          name: newWebhookName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setWebhooks([...webhooks, data.webhook]);
        setNewWebhookName('');
        setShowCreateWebhook(false);
        alert('Webhook created successfully!');
      } else {
        alert('Failed to create webhook');
      }
    } catch (error) {
      alert('Error creating webhook');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/delete-webhook', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bot ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webhookId }),
      });

      if (res.ok) {
        setWebhooks(webhooks.filter(w => w.id !== webhookId));
        alert('Webhook deleted successfully!');
      } else {
        alert('Failed to delete webhook');
      }
    } catch (error) {
      alert('Error deleting webhook');
    } finally {
      setActionLoading(false);
    }
  };

  const updateServerSettings = async () => {
    if (!selectedGuild || !newServerName.trim()) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/guild-settings', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bot ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guildId: selectedGuild.id,
          name: newServerName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGuildSettings(data.guild);
        setSelectedGuild({ ...selectedGuild, name: data.guild.name });
        setGuilds(guilds.map(g => g.id === selectedGuild.id ? { ...g, name: data.guild.name } : g));
        alert('Server settings updated successfully!');
      } else {
        alert('Failed to update server settings');
      }
    } catch (error) {
      alert('Error updating server settings');
    } finally {
      setActionLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('bot_token');
    router.push('/');
  };

  const getChannelIcon = (type: number) => {
    if (type === 2) return '🔊';
    if (type === 4) return '📁';
    return '#';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);

    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getAvatarUrl = (user: { id: string; avatar: string | null }) => {
    if (user.avatar) {
      return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
    }
    return `https://cdn.discordapp.com/embed/avatars/${Number.parseInt(user.id) % 5}.png`;
  };

  return (
    <div className="h-screen flex bg-[#313338] text-white overflow-hidden">
      {/* Server List */}
      <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2 overflow-y-auto">
        <div className="w-12 h-12 bg-[#5865f2] rounded-2xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer mb-2">
          <svg width="28" height="20" viewBox="0 0 71 55" fill="white">
            <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" />
          </svg>
        </div>

        <div className="w-8 h-0.5 bg-[#35363c] rounded-full" />

        {guilds.map((guild) => (
          <div
            key={guild.id}
            onClick={() => selectGuild(guild)}
            className={`w-12 h-12 rounded-full hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer text-sm font-semibold overflow-hidden ${
              selectedGuild?.id === guild.id ? 'bg-[#5865f2] rounded-xl' : 'bg-[#313338] hover:bg-[#5865f2]'
            }`}
          >
            {guild.icon ? (
              <img
                src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                alt={guild.name}
                className="w-full h-full object-cover"
              />
            ) : (
              guild.name.substring(0, 2).toUpperCase()
            )}
          </div>
        ))}
      </div>

      {/* Channels Sidebar */}
      <div className="w-60 bg-[#2b2d31] flex flex-col">
        {selectedGuild ? (
          <>
            <div className="h-12 px-4 border-b border-[#1e1f22] flex items-center justify-between shadow-sm">
              <h2 className="font-semibold truncate">{selectedGuild.name}</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <div className="mb-4">
                <div className="flex items-center justify-between px-2 mb-1">
                  <span className="text-xs font-semibold text-[#949ba4] uppercase">Text Channels</span>
                  <button
                    onClick={() => setShowCreateChannel(true)}
                    className="text-[#949ba4] hover:text-white text-lg"
                  >
                    +
                  </button>
                </div>
                {channels.filter(c => c.type === 0).map((channel) => (
                  <div
                    key={channel.id}
                    onClick={() => selectChannel(channel)}
                    className={`flex items-center justify-between px-2 py-1 rounded hover:bg-[#35373c] cursor-pointer group ${
                      selectedChannel?.id === channel.id ? 'bg-[#404249] text-white' : 'text-[#949ba4]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{getChannelIcon(channel.type)}</span>
                      <span className="text-sm">{channel.name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChannel(channel.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <div className="flex items-center px-2 mb-1">
                  <span className="text-xs font-semibold text-[#949ba4] uppercase">Voice Channels</span>
                </div>
                {channels.filter(c => c.type === 2).map((channel) => (
                  <div
                    key={channel.id}
                    className="flex items-center justify-between px-2 py-1 rounded hover:bg-[#35373c] cursor-pointer group text-[#949ba4]"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{getChannelIcon(channel.type)}</span>
                      <span className="text-sm">{channel.name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChannel(channel.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between px-2 mb-1">
                  <span className="text-xs font-semibold text-[#949ba4] uppercase">Roles</span>
                  <button
                    onClick={() => setShowCreateRole(true)}
                    className="text-[#949ba4] hover:text-white text-lg"
                  >
                    +
                  </button>
                </div>
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between px-2 py-1 rounded hover:bg-[#35373c] group text-[#949ba4]"
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: role.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#99aab5' }}
                      />
                      <span className="text-sm">{role.name}</span>
                    </div>
                    {role.name !== '@everyone' && (
                      <button
                        onClick={() => deleteRole(role.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="h-14 bg-[#232428] px-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#5865f2] rounded-full flex items-center justify-center text-xs font-semibold">
                  BOT
                </div>
                <div className="text-xs">
                  <div className="font-semibold">Bot Dashboard</div>
                  <div className="text-[#949ba4]">Managing {guilds.length} servers</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-[#949ba4] hover:text-white"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-4.293 4.293a1 1 0 01-1.414 0L4 7.414 5.414 6l3.293 3.293L13.586 5 15 6.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#949ba4] text-sm">
            Select a server
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-[#313338]">
        {selectedChannel || selectedGuild ? (
          <>
            <div className="h-12 px-4 border-b border-[#26272b] flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                {selectedChannel && (
                  <>
                    <span className="text-lg">{getChannelIcon(selectedChannel.type)}</span>
                    <h3 className="font-semibold">{selectedChannel.name}</h3>
                  </>
                )}
                {!selectedChannel && selectedGuild && (
                  <h3 className="font-semibold">{selectedGuild.name} Settings</h3>
                )}
              </div>

              {selectedChannel && selectedChannel.type === 0 && (
                <div className="flex gap-1 bg-[#1e1f22] rounded">
                  <button
                    onClick={() => setActiveTab('messages')}
                    className={`px-3 py-1 text-sm rounded ${activeTab === 'messages' ? 'bg-[#404249] text-white' : 'text-[#949ba4] hover:text-white'}`}
                  >
                    Messages
                  </button>
                  <button
                    onClick={() => setActiveTab('webhooks')}
                    className={`px-3 py-1 text-sm rounded ${activeTab === 'webhooks' ? 'bg-[#404249] text-white' : 'text-[#949ba4] hover:text-white'}`}
                  >
                    Webhooks
                  </button>
                </div>
              )}

              {selectedGuild && !selectedChannel && (
                <div className="flex gap-1 bg-[#1e1f22] rounded">
                  <button
                    onClick={() => setActiveTab('members')}
                    className={`px-3 py-1 text-sm rounded ${activeTab === 'members' ? 'bg-[#404249] text-white' : 'text-[#949ba4] hover:text-white'}`}
                  >
                    Members
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-3 py-1 text-sm rounded ${activeTab === 'settings' ? 'bg-[#404249] text-white' : 'text-[#949ba4] hover:text-white'}`}
                  >
                    Settings
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Messages Tab */}
              {activeTab === 'messages' && selectedChannel && selectedChannel.type === 0 && (
                <div className="p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-sm text-[#949ba4]">
                      This is the beginning of #{selectedChannel.name}
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className="flex gap-3 hover:bg-[#2e3035] p-2 rounded">
                        <img
                          src={getAvatarUrl(msg.author)}
                          alt={msg.author.username}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{msg.author.username}</span>
                            <span className="text-xs text-[#949ba4]">{formatTimestamp(msg.timestamp)}</span>
                          </div>
                          <div className="text-white">{msg.content}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Webhooks Tab */}
              {activeTab === 'webhooks' && selectedChannel && selectedChannel.type === 0 && (
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Webhooks</h3>
                    <Button
                      onClick={() => setShowCreateWebhook(true)}
                      className="bg-[#5865f2] hover:bg-[#4752c4]"
                    >
                      Create Webhook
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {webhooks.length === 0 ? (
                      <p className="text-[#949ba4] text-sm">No webhooks in this channel</p>
                    ) : (
                      webhooks.map((webhook) => (
                        <div key={webhook.id} className="bg-[#2b2d31] p-4 rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{webhook.name}</h4>
                              <p className="text-sm text-[#949ba4] mt-1">ID: {webhook.id}</p>
                              <div className="mt-2">
                                <Input
                                  value={webhook.url}
                                  readOnly
                                  className="bg-[#1e1f22] border-[#1e1f22] text-white text-sm"
                                  onClick={(e) => e.currentTarget.select()}
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => deleteWebhook(webhook.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Members Tab */}
              {activeTab === 'members' && selectedGuild && !selectedChannel && (
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Server Members ({members.length})</h3>
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div key={member.user.id} className="bg-[#2b2d31] p-4 rounded flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={getAvatarUrl(member.user)}
                            alt={member.user.username}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <div className="font-semibold">{member.user.username}#{member.user.discriminator}</div>
                            <div className="text-sm text-[#949ba4]">
                              Joined {new Date(member.joined_at).toLocaleDateString()}
                            </div>
                            <div className="flex gap-1 mt-1">
                              {member.roles.slice(0, 3).map(roleId => {
                                const role = roles.find(r => r.id === roleId);
                                return role && role.name !== '@everyone' ? (
                                  <span
                                    key={roleId}
                                    className="text-xs px-2 py-0.5 rounded"
                                    style={{
                                      backgroundColor: role.color ? `#${role.color.toString(16).padStart(6, '0')}33` : '#99aab533',
                                      color: role.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#99aab5'
                                    }}
                                  >
                                    {role.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                assignRole(member.user.id, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            className="bg-[#1e1f22] text-white text-sm px-2 py-1 rounded"
                          >
                            <option value="">Add Role</option>
                            {roles.filter(r => r.name !== '@everyone' && !member.roles.includes(r.id)).map(role => (
                              <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                          </select>
                          <Button
                            onClick={() => kickMember(member.user.id)}
                            variant="outline"
                            className="text-sm"
                          >
                            Kick
                          </Button>
                          <Button
                            onClick={() => banMember(member.user.id)}
                            className="bg-red-600 hover:bg-red-700 text-sm"
                          >
                            Ban
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && selectedGuild && !selectedChannel && guildSettings && (
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Server Settings</h3>
                  <div className="space-y-4 max-w-2xl">
                    <div>
                      <label className="block text-sm font-semibold text-[#b5bac1] uppercase mb-2">
                        Server Name
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={newServerName}
                          onChange={(e) => setNewServerName(e.target.value)}
                          className="bg-[#1e1f22] border-[#1e1f22] text-white"
                        />
                        <Button
                          onClick={updateServerSettings}
                          disabled={actionLoading || newServerName === guildSettings.name}
                          className="bg-[#5865f2] hover:bg-[#4752c4]"
                        >
                          Update
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#b5bac1] uppercase mb-2">
                        Server ID
                      </label>
                      <Input
                        value={guildSettings.id}
                        readOnly
                        className="bg-[#1e1f22] border-[#1e1f22] text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#b5bac1] uppercase mb-2">
                        Verification Level
                      </label>
                      <div className="bg-[#1e1f22] p-3 rounded">
                        <p className="text-white">
                          {['None', 'Low', 'Medium', 'High', 'Very High'][guildSettings.verification_level || 0]}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#b5bac1] uppercase mb-2">
                        Owner
                      </label>
                      <div className="bg-[#1e1f22] p-3 rounded">
                        <p className="text-white">{guildSettings.owner ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {selectedChannel && selectedChannel.type === 0 && activeTab === 'messages' && (
              <div className="p-4">
                <div className="bg-[#383a40] rounded-lg">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder={`Message #${selectedChannel.name}`}
                    className="bg-transparent border-none text-white placeholder:text-[#6d6f78] focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <div className="px-4 pb-3 flex justify-end">
                    <Button
                      onClick={sendMessage}
                      disabled={actionLoading || !message.trim()}
                      className="bg-[#5865f2] hover:bg-[#4752c4]"
                    >
                      Send Message
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#949ba4]">
            Select a server to get started
          </div>
        )}
      </div>

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#313338] rounded-lg p-6 w-96">
            <h3 className="text-xl font-semibold mb-4">Create Channel</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#b5bac1] uppercase mb-2">
                  Channel Name
                </label>
                <Input
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="bg-[#1e1f22] border-[#1e1f22] text-white"
                  placeholder="new-channel"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#b5bac1] uppercase mb-2">
                  Channel Type
                </label>
                <select
                  value={newChannelType}
                  onChange={(e) => setNewChannelType(Number(e.target.value))}
                  className="w-full bg-[#1e1f22] border-[#1e1f22] text-white rounded-md px-3 py-2"
                >
                  <option value={0}>Text Channel</option>
                  <option value={2}>Voice Channel</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={createChannel}
                  disabled={actionLoading || !newChannelName.trim()}
                  className="flex-1 bg-[#5865f2] hover:bg-[#4752c4]"
                >
                  Create
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateChannel(false);
                    setNewChannelName('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#313338] rounded-lg p-6 w-96">
            <h3 className="text-xl font-semibold mb-4">Create Role</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#b5bac1] uppercase mb-2">
                  Role Name
                </label>
                <Input
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="bg-[#1e1f22] border-[#1e1f22] text-white"
                  placeholder="new role"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={createRole}
                  disabled={actionLoading || !newRoleName.trim()}
                  className="flex-1 bg-[#5865f2] hover:bg-[#4752c4]"
                >
                  Create
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateRole(false);
                    setNewRoleName('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Webhook Modal */}
      {showCreateWebhook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#313338] rounded-lg p-6 w-96">
            <h3 className="text-xl font-semibold mb-4">Create Webhook</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#b5bac1] uppercase mb-2">
                  Webhook Name
                </label>
                <Input
                  value={newWebhookName}
                  onChange={(e) => setNewWebhookName(e.target.value)}
                  className="bg-[#1e1f22] border-[#1e1f22] text-white"
                  placeholder="My Webhook"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={createWebhook}
                  disabled={actionLoading || !newWebhookName.trim()}
                  className="flex-1 bg-[#5865f2] hover:bg-[#4752c4]"
                >
                  Create
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateWebhook(false);
                    setNewWebhookName('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
