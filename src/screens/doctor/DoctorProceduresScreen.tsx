import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Plus,
  Sparkles,
  Search,
  Check,
  Edit2,
  X,
  Database,
  RefreshCw,
} from 'lucide-react-native';
import { useDoctorStore } from '../../stores/doctor.store';
import { Procedure, ProcedureCategory } from '../../types/procedure.types';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';

export const DoctorProceduresScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    activeClinic,
    knowledgeBaseProcedures,
    clinicProcedures,
    updateProcedurePricing,
    addNewProcedureToKnowledgeBase,
    toggleProcedureOffering,
    initializeDoctorPortal,
    loading,
  } = useDoctorStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Edit Price State
  const [editingItem, setEditingItem] = useState<{
    procedureId: string;
    name: string;
    priceFrom: number;
    priceUnit: string;
  } | null>(null);

  // Minimal "Add Procedure" Modal State (Only 3 inputs: Name, Category, Price)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<ProcedureCategory>('skin');
  const [newPrice, setNewPrice] = useState('3500');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  useEffect(() => {
    initializeDoctorPortal();
  }, []);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'skin', label: 'Skin' },
    { id: 'hair', label: 'Hair' },
    { id: 'laser', label: 'Laser' },
    { id: 'aesthetics', label: 'Aesthetics' },
  ];

  const filteredProcedures = knowledgeBaseProcedures.filter((proc) => {
    const matchesSearch =
      proc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proc.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proc.categoryLabel && proc.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'all' ||
      proc.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const getClinicPricing = (procId: string, procSlug: string) => {
    return clinicProcedures.find(
      (cp) => cp.procedureId === procId || cp.id === procId || (cp.procedures && cp.procedures.slug === procSlug)
    );
  };

  const handleSavePrice = async () => {
    if (!editingItem) return;
    await updateProcedurePricing(editingItem.procedureId, {
      priceFrom: Number(editingItem.priceFrom) || 2500,
      priceUnit: editingItem.priceUnit || 'per session',
    });
    setEditingItem(null);
  };

  const handleQuickCreate = async () => {
    if (!newName.trim()) return;

    setIsSubmittingNew(true);
    await addNewProcedureToKnowledgeBase({
      name: newName.trim(),
      category: newCategory,
      shortDescription: `Clinical-grade ${newName.trim()} procedure supervised by board-certified dermatologist.`,
      description: `Comprehensive ${newName.trim()} procedure tailored to individual skin and aesthetic goals.`,
      downtime: 'Zero downtime',
      benefits: ['Dermatologist supervised', 'Results-driven protocol'],
      priceFrom: Number(newPrice.trim()) || 3500,
      priceUnit: newCategory === 'aesthetics' ? 'per session / unit' : 'per session',
    });

    setIsSubmittingNew(false);
    setShowAddModal(false);
    setNewName('');
    setNewPrice('3500');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Procedures & Pricing</Text>
          <Text style={styles.headerSubtitle}>
            {clinicProcedures.length} Offered • {activeClinic.name || 'Your Clinic'}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={initializeDoctorPortal}
            style={[styles.refreshIconBtn, shadows.subtle]}
          >
            <RefreshCw size={15} color={colors.primaryDark} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => setShowAddModal(true)}
            style={[styles.addBtn, shadows.subtle]}
          >
            <Plus size={16} color={colors.textInverse} />
            <Text style={styles.addBtnText}>Add Procedure</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={initializeDoctorPortal} />
        }
      >
        {/* Search */}
        <View style={[styles.searchBox, shadows.subtle]}>
          <Search size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search procedures..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={15} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.8}
              onPress={() => setSelectedCategory(cat.id)}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat.id && styles.categoryChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Procedures Clean List */}
        <View style={styles.proceduresList}>
          {filteredProcedures.map((proc) => {
            const pricing = getClinicPricing(proc.id, proc.slug);
            const isOffered = !!pricing;

            return (
              <View key={proc.id} style={[styles.procCard, shadows.subtle]}>
                <View style={styles.procMainRow}>
                  <View style={styles.procTextCol}>
                    <Text style={styles.procCategoryText}>{proc.category.toUpperCase()}</Text>
                    <Text style={styles.procName}>{proc.name}</Text>
                  </View>

                  <Switch
                    value={isOffered}
                    onValueChange={(val) => toggleProcedureOffering(proc, val)}
                    trackColor={{ false: colors.border, true: '#2D8A4E' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {isOffered && pricing ? (
                  <View style={styles.priceRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        setEditingItem({
                          procedureId: pricing.procedureId || proc.id,
                          name: proc.name,
                          priceFrom: pricing.priceFrom,
                          priceUnit: pricing.priceUnit,
                        })
                      }
                      style={styles.priceTagBtn}
                    >
                      <Text style={styles.priceTagText}>
                        ₹{pricing.priceFrom.toLocaleString('en-IN')}{' '}
                        <Text style={styles.priceTagUnit}>({pricing.priceUnit})</Text>
                      </Text>
                      <Edit2 size={12} color={colors.primaryDark} style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Minimal "Edit Price" Sheet */}
      <Modal
        visible={!!editingItem}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditingItem(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalSheet, shadows.floating]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Pricing</Text>
              <TouchableOpacity onPress={() => setEditingItem(null)} style={styles.modalClose}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalItemName}>{editingItem?.name}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price in INR (₹)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                autoFocus
                value={editingItem?.priceFrom ? String(editingItem.priceFrom) : ''}
                onChangeText={(val) =>
                  setEditingItem(editingItem ? { ...editingItem, priceFrom: Number(val) || 0 } : null)
                }
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleSavePrice}
              style={styles.saveBtn}
            >
              <Text style={styles.saveBtnText}>Save Price</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Ultra-Minimal "Add New Procedure" Modal (Only 3 essential inputs) */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalSheet, shadows.floating]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleBox}>
                <Sparkles size={18} color={colors.primary} />
                <Text style={styles.modalTitle}>Add Procedure</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.modalClose}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* 1. Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Procedure Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Carbon Laser Peel"
                placeholderTextColor={colors.textMuted}
                autoFocus
                value={newName}
                onChangeText={setNewName}
              />
            </View>

            {/* 2. Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryPickerRow}>
                {(['skin', 'hair', 'laser', 'aesthetics'] as ProcedureCategory[]).map(
                  (cat) => (
                    <TouchableOpacity
                      key={cat}
                      activeOpacity={0.8}
                      onPress={() => setNewCategory(cat)}
                      style={[
                        styles.catPickerBtn,
                        newCategory === cat && styles.catPickerBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.catPickerBtnText,
                          newCategory === cat && styles.catPickerBtnTextActive,
                        ]}
                      >
                        {cat.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            {/* 3. Starting Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Starting Price (₹)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="3500"
                keyboardType="numeric"
                value={newPrice}
                onChangeText={setNewPrice}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleQuickCreate}
              disabled={isSubmittingNew || !newName.trim()}
              style={[
                styles.saveBtn,
                !newName.trim() && { opacity: 0.6 },
              ]}
            >
              {isSubmittingNew ? (
                <ActivityIndicator color={colors.textInverse} size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Add Procedure</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshIconBtn: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    gap: 5,
  },
  addBtnText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
    color: colors.textInverse,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },

  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSizes.body - 1,
    color: colors.text,
    padding: 0,
  },

  // Category Pills
  categoriesRow: {
    gap: 6,
    marginBottom: 14,
  },
  categoryChip: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    fontSize: typography.fontSizes.micro + 0.5,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.textInverse,
    fontWeight: typography.fontWeights.bold,
  },

  // Clean Procedure List
  proceduresList: {
    gap: 8,
  },
  procCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  procMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  procTextCol: {
    flex: 1,
    marginRight: 10,
  },
  procCategoryText: {
    fontSize: typography.fontSizes.micro - 0.5,
    fontWeight: typography.fontWeights.bold,
    color: colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  procName: {
    fontSize: typography.fontSizes.body - 0.5,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  priceRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
  },
  priceTagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  priceTagText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
  priceTagUnit: {
    fontWeight: typography.fontWeights.medium,
    color: colors.textSecondary,
    fontSize: typography.fontSizes.micro + 0.5,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalHeaderTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalTitle: {
    fontSize: typography.fontSizes.h3 - 1,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
  },
  modalClose: {
    padding: 4,
  },
  modalItemName: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: typography.fontSizes.caption - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: typography.fontSizes.body - 1,
    color: colors.text,
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catPickerBtn: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  catPickerBtnActive: {
    backgroundColor: colors.primary,
  },
  catPickerBtnText: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.bold,
    color: colors.textSecondary,
  },
  catPickerBtnTextActive: {
    color: colors.textInverse,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.textInverse,
  },
});
