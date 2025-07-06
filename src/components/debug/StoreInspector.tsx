import React from "react";
import { useAssistantStore } from "@/lib/stores/assistantStore";
import { useNotesStore } from "@/lib/stores/notesStore";
import { useTasksStore } from "@/lib/stores/tasksStore";

// A simple debug component to visualize the state of persisted stores
const StoreInspector: React.FC = () => {
  // Get stores
  const assistantStore = useAssistantStore();
  const notesStore = useNotesStore();
  const tasksStore = useTasksStore();

  // Extract key metrics from assistant store
  const conversationCount = assistantStore.conversationMetadata?.length || 0;
  const totalMessages = Object.values(assistantStore.conversations || {})
    .flat()
    .length;
  const currentConversation = assistantStore.getCurrentConversation();
  const currentMessagesCount = currentConversation?.length || 0;

  // Extract metrics from notes store
  const notesCount = notesStore.notes?.length || 0;

  // Extract metrics from tasks store
  const tasksCount = tasksStore.tasks?.length || 0;
  const completedTasksCount = tasksStore.tasks?.filter(task => task.completed)?.length || 0;

  return (
    <div className="p-4 bg-black/30 rounded-lg text-white text-sm">
      <h2 className="text-lg font-semibold mb-2">Store Persistence Inspector</h2>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <h3 className="font-medium">Assistant Store</h3>
          <ul className="list-disc pl-4">
            <li>Conversations: {conversationCount}</li>
            <li>Total Messages: {totalMessages}</li>
            <li>Current Conversation Messages: {currentMessagesCount}</li>
            <li>Current ID: {assistantStore.currentConversationId || "none"}</li>
          </ul>
        </div>
        <div>
          <h3 className="font-medium">Notes Store</h3>
          <ul className="list-disc pl-4">
            <li>Notes: {notesCount}</li>
          </ul>
        </div>
        <div>
          <h3 className="font-medium">Tasks Store</h3>
          <ul className="list-disc pl-4">
            <li>Tasks: {tasksCount}</li>
            <li>Completed: {completedTasksCount}</li>
          </ul>
        </div>
      </div>
      <div className="mt-4 text-xs text-gray-400">
        <p>
          To test persistence: Add content to stores, note the counts above,
          then refresh the page. The counts should remain the same.
        </p>
      </div>
    </div>
  );
};

export default StoreInspector;
