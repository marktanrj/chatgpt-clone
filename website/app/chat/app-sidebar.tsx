'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar"
import { Button } from "../../components/ui/button"
import { useLogout } from "../../hooks/auth/use-logout";
import { Chat } from "../../api/chat-api";
import { useChats } from "../../hooks/chat";
import { useParams, useRouter } from "next/navigation";
import { ChatMenuButton } from "./chat-menu-button";

export function AppSidebar() {
  const { logout } = useLogout();
  const router = useRouter();
  const params = useParams()

  const { data: chats, isLoading } = useChats(30);

  const handleNewChat = () => {
    router.push('/chat');
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <Button onClick={handleNewChat}>
            New Chat
          </Button>
          <SidebarGroupLabel className="mt-3">Recent Chats</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  loading..
                </div>
              ) : chats?.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No chats yet
                </div>
              ) : (
                chats?.map((chat: Chat) => 
                  <ChatMenuButton
                    key={chat.id}
                    chat={chat}
                    currentId={params.id}
                  />
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>

        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button className="w-full" onClick={logout}>
          Log Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
