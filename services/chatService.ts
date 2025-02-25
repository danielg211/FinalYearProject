import { supabase } from "../lib/supabase";

// ✅ Define Message type
export type Message = {
  id: string;
  sender_golfer_id?: string;
  sender_pga_id?: string;
  receiver_golfer_id?: string;
  receiver_pga_id?: string;
  message_text: string;
  created_at: string;
};

// ✅ Fetch messages between a Golfer and PGA Professional
export const fetchMessages = async (
  senderId: string,
  senderType: "golfer" | "pga",
  receiverId: string,
  receiverType: "golfer" | "pga"
): Promise<Message[]> => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_golfer_id.eq.${senderId},receiver_pga_id.eq.${receiverId}),and(sender_pga_id.eq.${receiverId},receiver_golfer_id.eq.${senderId}),and(sender_pga_id.eq.${senderId},receiver_golfer_id.eq.${receiverId}),and(sender_golfer_id.eq.${receiverId},receiver_pga_id.eq.${senderId})`
    )
    .order("created_at", { ascending: true });

  if (error) {
    console.error("❌ Error fetching messages:", error);
    return [];
  }

  return data as Message[];
};



// ✅ Send a message
export const sendMessage = async (
  senderId: string,
  senderType: "golfer" | "pga",
  receiverId: string,
  receiverType: "golfer" | "pga",
  messageText: string
): Promise<void> => {
  if (messageText.trim() === "") return;

  // Ensure valid sender/receiver pairing
  if (
    (senderType === "golfer" && receiverType !== "pga") ||
    (senderType === "pga" && receiverType !== "golfer")
  ) {
    console.error("Invalid message: A golfer can only message a PGA professional and vice versa.");
    return;
  }

  const { error } = await supabase.from("messages").insert([
    {
      sender_golfer_id: senderType === "golfer" ? senderId : null,
      sender_pga_id: senderType === "pga" ? senderId : null,
      receiver_golfer_id: receiverType === "golfer" ? receiverId : null,
      receiver_pga_id: receiverType === "pga" ? receiverId : null,
      message_text: messageText,
    },
  ]);

  if (error) {
    console.error("Error sending message:", error);
  }
};
