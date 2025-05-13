
-- Migrate to add new message_type for conversation_messages
ALTER TABLE conversation_messages DROP CONSTRAINT IF EXISTS conversation_messages_message_type_check;
ALTER TABLE conversation_messages ADD CONSTRAINT conversation_messages_message_type_check CHECK (message_type IN ('question', 'answer', 'evaluation', 'feedback'));

-- Update existing table indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_messages_session_id ON conversation_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_topic ON learning_sessions(topic);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON learning_sessions(user_id);
