import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import {
  Send,
  Sparkles,
  Bot,
  RotateCcw,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
} from 'lucide-react-native';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { iraRagService, ChatMessage, STARTER_QUESTIONS } from '../../services/iraRag.service';
import { Procedure } from '../../types/procedure.types';
import { analytics } from '../../services/analytics.service';

export const IraChatScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Handle incoming initialQuery or initialProcedure
  useEffect(() => {
    if (route.params?.initialQuery) {
      handleSend(route.params.initialQuery);
    }
  }, [route.params?.initialQuery]);

  const scrollToBottom = (delay = 100) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, delay);
  };

  const handleSend = async (queryToSend?: string) => {
    const text = (queryToSend || inputText).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);
    scrollToBottom(50);

    analytics.track('ira_chat_query', { query: text });

    try {
      const history = newMessages.map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text,
      }));

      const res = await iraRagService.askIra(text, history);

      const iraMsg: ChatMessage = {
        id: 'ira_' + Date.now(),
        sender: 'ira',
        text: res.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        referencedProcedures: res.referencedProcedures,
        suggestedFollowUps: res.suggestedFollowUps,
      };

      setMessages((prev) => [...prev, iraMsg]);
    } catch (err) {
      console.warn('Ira chat error:', err);
    } finally {
      setIsTyping(false);
      scrollToBottom(150);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
  };

  const handleProcedurePress = (slug: string) => {
    analytics.track('ira_procedure_card_clicked', { slug });
    navigation.navigate('ProcedureDetailModal', { procedureSlug: slug });
  };

  // Helper to format text with bold segments
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
      <Text style={styles.messageText}>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <Text key={i} style={styles.boldText}>
                {part.slice(2, -2)}
              </Text>
            );
          }
          return <Text key={i}>{part}</Text>;
        })}
      </Text>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Ira Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarWrapper}>
            <Sparkles size={20} color={colors.textInverse} />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.headerTitle}>Ira</Text>
            </View>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.headerSubtitle}>Verified Knowledge Base</Text>
            </View>
          </View>
        </View>

        {messages.length > 0 && (
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleResetChat}
            activeOpacity={0.7}
          >
            <RotateCcw size={16} color={colors.textSecondary} />
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 84 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Welcome Screen / Empty State */}
          {messages.length === 0 && (
            <View style={styles.welcomeContainer}>
              <View style={styles.heroCard}>
                <View style={styles.heroIconCircle}>
                  <Sparkles size={28} color={colors.primary} />
                </View>
                <Text style={styles.heroTitle}>Ask Ira Anything</Text>
                <Text style={styles.heroDescription}>
                  I’m your dedicated aesthetic procedure consultant. I provide strictly verified clinical guidance on downtime, expected results, session schedules, and treatment comparisons from our clinic knowledge base.
                </Text>

                <View style={styles.shieldRow}>
                  <ShieldCheck size={16} color={colors.primaryDark} />
                  <Text style={styles.shieldText}>Grounding verified by certified dermatologists</Text>
                </View>
              </View>

              {/* Starter Question Suggestions */}
              <View style={styles.suggestionsHeaderRow}>
                <Text style={styles.suggestionsHeader}>Suggested Questions</Text>
                <Text style={styles.suggestionsSub}>Tap to ask Ira instantly</Text>
              </View>

              <View style={styles.suggestionsGrid}>
                {STARTER_QUESTIONS.map((q, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.suggestionChip}
                    onPress={() => handleSend(q)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.suggestionText}>{q}</Text>
                    <ArrowRight size={14} color={colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Conversation Stream */}
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                msg.sender === 'user' ? styles.messageRowUser : styles.messageRowIra,
              ]}
            >
              {msg.sender === 'ira' && (
                <View style={styles.botIconCircle}>
                  <Bot size={15} color={colors.primary} />
                </View>
              )}

              <View style={styles.messageBubbleWrapper}>
                <View
                  style={[
                    styles.messageBubble,
                    msg.sender === 'user' ? styles.bubbleUser : styles.bubbleIra,
                  ]}
                >
                  {renderFormattedText(msg.text)}
                  <Text
                    style={[
                      styles.timestampText,
                      msg.sender === 'user' ? styles.timestampUser : styles.timestampIra,
                    ]}
                  >
                    {msg.timestamp}
                  </Text>
                </View>

                {/* Referenced Procedure Interactive Cards */}
                {msg.referencedProcedures && msg.referencedProcedures.length > 0 && (
                  <View style={styles.referencedProceduresContainer}>
                    <Text style={styles.referencedTitle}>Recommended Treatments</Text>
                    {msg.referencedProcedures.map((proc) => (
                      <TouchableOpacity
                        key={proc.id}
                        style={styles.procedureCard}
                        onPress={() => handleProcedurePress(proc.slug)}
                        activeOpacity={0.8}
                      >
                        <Image
                          source={{ uri: proc.heroImageUrl }}
                          style={styles.procImage}
                          contentFit="cover"
                        />
                        <View style={styles.procInfo}>
                          <View style={styles.procCategoryBadge}>
                            <Text style={styles.procCategoryText}>
                              {proc.categoryLabel || proc.category}
                            </Text>
                          </View>
                          <Text style={styles.procName} numberOfLines={1}>
                            {proc.name}
                          </Text>
                          <Text style={styles.procDesc} numberOfLines={2}>
                            {proc.shortDescription}
                          </Text>
                          <View style={styles.procActionRow}>
                            <Text style={styles.procActionText}>View Details & Pricing</Text>
                            <ChevronRight size={13} color={colors.primary} />
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Suggested Follow-Ups */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <View style={styles.followUpsRow}>
                    {msg.suggestedFollowUps.map((fu, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.followUpChip}
                        onPress={() => handleSend(fu)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.followUpText}>{fu}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={[styles.messageRow, styles.messageRowIra]}>
              <View style={styles.botIconCircle}>
                <Bot size={15} color={colors.primary} />
              </View>
              <View style={[styles.messageBubble, styles.bubbleIra, styles.typingBubble]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.typingText}>Ira is consulting knowledge base...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask Ira (e.g. Botox downtime, acne scars)..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            activeOpacity={0.8}
          >
            <Send size={18} color={colors.textInverse} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.subtle,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
  },
  aiBadge: {
    backgroundColor: '#F3E4BF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 1,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D32',
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.semibold,
  },

  container: {
    flex: 1,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },

  // Welcome Hero
  welcomeContainer: {
    gap: 20,
    paddingVertical: 8,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  heroIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F7EEDD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: typography.fontSizes.h2,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
    marginBottom: 6,
  },
  heroDescription: {
    fontSize: typography.fontSizes.body - 1,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  shieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF5EE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  shieldText: {
    fontSize: 11,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primaryDark,
  },

  // Suggestions
  suggestionsHeaderRow: {
    marginTop: 4,
  },
  suggestionsHeader: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  suggestionsSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  suggestionsGrid: {
    gap: 10,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    flex: 1,
    marginRight: 10,
  },

  // Chat stream
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    width: '100%',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowIra: {
    justifyContent: 'flex-start',
  },
  botIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3E4BF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  messageBubbleWrapper: {
    maxWidth: '82%',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  bubbleIra: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },
  boldText: {
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
  timestampText: {
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  timestampUser: {
    color: 'rgba(255,255,255,0.7)',
  },
  timestampIra: {
    color: colors.textMuted,
  },

  // Typing
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  typingText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },

  // Referenced Procedure Cards
  referencedProceduresContainer: {
    marginTop: 10,
    gap: 8,
  },
  referencedTitle: {
    fontSize: 11,
    fontWeight: typography.fontWeights.heavy,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 2,
  },
  procedureCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.subtle,
  },
  procImage: {
    width: 75,
    height: '100%',
    backgroundColor: '#EBE6DE',
  },
  procInfo: {
    flex: 1,
    padding: 10,
  },
  procCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  procCategoryText: {
    fontSize: 9,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  procName: {
    fontSize: 13,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 2,
  },
  procDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 14,
    marginBottom: 6,
  },
  procActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  procActionText: {
    fontSize: 11,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },

  // Follow up chips
  followUpsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  followUpChip: {
    backgroundColor: '#F6F1E7',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.pill,
  },
  followUpText: {
    fontSize: 11,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 100,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1C8B8',
    shadowOpacity: 0,
    elevation: 0,
  },
});
