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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Plus,
  Sparkles,
  Search,
  Check,
  Edit2,
  DollarSign,
  Tag,
  FileText,
  Layers,
  Clock,
  X,
  Database,
  ExternalLink,
} from 'lucide-react-native';
import { useDoctorStore } from '../../stores/doctor.store';
import { Procedure, ProcedureCategory } from '../../types/procedure.types';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { NewProcedurePayload } from '../../services/doctor.service';

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

  // Edit Price Modal State
  const [editingItem, setEditingItem] = useState<{
    procedureId: string;
    name: string;
    priceFrom: number;
    priceTo?: number;
    priceUnit: string;
    isAvailable: boolean;
  } | null>(null);

  // New Procedure Knowledge Base Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<ProcedureCategory>('skin');
  const [newShortDesc, setNewShortDesc] = useState('');
  const [newDowntime, setNewDowntime] = useState('Zero downtime');
  const [newBenefits, setNewBenefits] = useState('');
  const [newPriceFrom, setNewPriceFrom] = useState('3500');
  const [newPriceTo, setNewPriceTo] = useState('7000');
  const [newPriceUnit, setNewPriceUnit] = useState('per session');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  useEffect(() => {
    initializeDoctorPortal();
  }, []);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'skin', label: 'Skin' },
    { id: 'laser', label: 'Laser' },
    { id: 'injectables', label: 'Injectables' },
    { id: 'hair', label: 'Hair' },
    { id: 'anti_ageing', label: 'Anti-Ageing' },
  ];

  const filteredProcedures = knowledgeBaseProcedures.filter((proc) => {
    const matchesSearch =
      proc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proc.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || proc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getClinicPricingForProcedure = (procId: string, procSlug: string) => {
    return clinicProcedures.find(
      (cp) => cp.procedureId === procId || cp.id === procId || (cp.procedures && cp.procedures.slug === procSlug)
    );
  };

  const handleSavePrice = async () => {
    if (!editingItem) return;
    await updateProcedurePricing(editingItem.procedureId, {
      priceFrom: Number(editingItem.priceFrom),
      priceTo: editingItem.priceTo ? Number(editingItem.priceTo) : undefined,
      priceUnit: editingItem.priceUnit,
      isAvailable: editingItem.isAvailable,
    });
    setEditingItem(null);
  };

  const handleCreateNewProcedure = async () => {
    if (!newName.trim() || !newShortDesc.trim() || !newPriceFrom.trim()) {
      Alert.alert('Required Fields', 'Please enter procedure name, description and starting price.');
      return;
    }

    setIsSubmittingNew(true);
    const benefitsList = newBenefits
      .split('\n')
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    const payload: NewProcedurePayload = {
      name: newName.trim(),
      category: newCategory,
      shortDescription: newShortDesc.trim(),
      description: newShortDesc.trim(),
      downtime: newDowntime.trim(),
      benefits: benefitsList,
      priceFrom: Number(newPriceFrom.trim()),
      priceTo: newPriceTo.trim() ? Number(newPriceTo.trim()) : undefined,
      priceUnit: newPriceUnit.trim(),
    };

    await addNewProcedureToKnowledgeBase(payload);
    setIsSubmittingNew(false);
    setShowAddModal(false);

    // Reset form
    setNewName('');
    setNewShortDesc('');
    setNewBenefits('');
    setNewPriceFrom('3500');
    setNewPriceTo('7000');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Procedures & Pricing</Text>
          <Text style={styles.headerSubtitle}>Master Knowledge Base</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowAddModal(true)}
          style={styles.addBtn}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Knowledge Base Info Card */}
        <View style={[styles.kbInfoBanner, shadows.subtle]}>
          <View style={styles.kbInfoTop}>
            <Database size={18} color={colors.primary} />
            <Text style={styles.kbInfoTitle}>Master Knowledge Base Catalog</Text>
          </View>
          <Text style={styles.kbInfoDesc}>
            Select procedures to offer at {activeClinic.name}. You can edit clinic pricing anytime or add new procedures to the knowledge base.
          </Text>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBox, shadows.subtle]}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search procedures in Knowledge Base..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Category Filter Chips */}
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

        {/* Procedures List */}
        <View style={styles.proceduresList}>
          {filteredProcedures.map((proc) => {
            const clinicPricing = getClinicPricingForProcedure(proc.id, proc.slug);
            const isOffered = !!clinicPricing;

            return (
              <View key={proc.id} style={[styles.procCard, shadows.subtle]}>
                <View style={styles.procCardHeader}>
                  <View style={styles.procCategoryBadge}>
                    <Text style={styles.procCategoryBadgeText}>{proc.category.toUpperCase()}</Text>
                  </View>
                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Offered in Clinic</Text>
                    <Switch
                      value={isOffered}
                      onValueChange={(val) => toggleProcedureOffering(proc, val)}
                      trackColor={{ false: colors.border, true: '#2D8A4E' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                </View>

                <Text style={styles.procName}>{proc.name}</Text>
                <Text style={styles.procDesc} numberOfLines={2}>
                  {proc.shortDescription}
                </Text>

                {/* Pricing Details */}
                {isOffered && clinicPricing ? (
                  <View style={styles.pricingRow}>
                    <View style={styles.priceDisplay}>
                      <Text style={styles.priceLabel}>Clinic Price:</Text>
                      <Text style={styles.priceValue}>
                        ₹{clinicPricing.priceFrom.toLocaleString('en-IN')}
                        {clinicPricing.priceTo ? ` – ₹${clinicPricing.priceTo.toLocaleString('en-IN')}` : ''}{' '}
                        <Text style={styles.priceUnit}>{clinicPricing.priceUnit}</Text>
                      </Text>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        setEditingItem({
                          procedureId: clinicPricing.procedureId || proc.id,
                          name: proc.name,
                          priceFrom: clinicPricing.priceFrom,
                          priceTo: clinicPricing.priceTo,
                          priceUnit: clinicPricing.priceUnit,
                          isAvailable: clinicPricing.isAvailable ?? true,
                        })
                      }
                      style={styles.editPriceBtn}
                    >
                      <Edit2 size={13} color={colors.primaryDark} />
                      <Text style={styles.editPriceBtnText}>Edit Price</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.notOfferedBox}>
                    <Text style={styles.notOfferedText}>Not currently enabled for this clinic.</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Edit Price Modal */}
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
              <Text style={styles.modalTitle}>Edit Clinic Pricing</Text>
              <TouchableOpacity onPress={() => setEditingItem(null)} style={styles.modalClose}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalProcedureName}>{editingItem?.name}</Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Price From (₹) *</Text>
              <TextInput
                style={styles.modalTextInput}
                keyboardType="numeric"
                value={editingItem?.priceFrom ? String(editingItem.priceFrom) : ''}
                onChangeText={(val) =>
                  setEditingItem(editingItem ? { ...editingItem, priceFrom: Number(val) || 0 } : null)
                }
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Price To (Optional, ₹)</Text>
              <TextInput
                style={styles.modalTextInput}
                keyboardType="numeric"
                placeholder="e.g. 15000"
                value={editingItem?.priceTo ? String(editingItem.priceTo) : ''}
                onChangeText={(val) =>
                  setEditingItem(editingItem ? { ...editingItem, priceTo: Number(val) || undefined } : null)
                }
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Pricing Unit *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="per session, per unit, etc."
                value={editingItem?.priceUnit || ''}
                onChangeText={(val) =>
                  setEditingItem(editingItem ? { ...editingItem, priceUnit: val } : null)
                }
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleSavePrice}
              style={styles.modalSaveBtn}
            >
              <Text style={styles.modalSaveBtnText}>Save Price Updates</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add New Procedure to Knowledge Base Modal */}
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
          <View style={[styles.modalSheetLarge, shadows.floating]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleBox}>
                <Sparkles size={18} color={colors.primary} />
                <Text style={styles.modalTitle}>Add to Knowledge Base</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.modalClose}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              <Text style={styles.modalSubtitle}>
                Add a new dermatological procedure to the master catalog and make it available in your clinic.
              </Text>

              {/* Procedure Name */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Procedure Name *</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="e.g. Carbon Laser Peel"
                  placeholderTextColor={colors.textMuted}
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              {/* Category */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Category *</Text>
                <View style={styles.categoryPickerRow}>
                  {(['skin', 'laser', 'injectables', 'hair', 'anti_ageing'] as ProcedureCategory[]).map(
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

              {/* Short Description */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Short Clinical Description *</Text>
                <TextInput
                  style={[styles.modalTextInput, { minHeight: 65, textAlignVertical: 'top' }]}
                  placeholder="Summary of how this procedure works and who it is for..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  value={newShortDesc}
                  onChangeText={setNewShortDesc}
                />
              </View>

              {/* Downtime */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Downtime & Recovery</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="e.g. Zero downtime, or 1–2 days mild redness"
                  placeholderTextColor={colors.textMuted}
                  value={newDowntime}
                  onChangeText={setNewDowntime}
                />
              </View>

              {/* Pricing */}
              <View style={styles.pricingInputRow}>
                <View style={[styles.modalInputGroup, { flex: 1 }]}>
                  <Text style={styles.modalInputLabel}>Price From (₹) *</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="3500"
                    keyboardType="numeric"
                    value={newPriceFrom}
                    onChangeText={setNewPriceFrom}
                  />
                </View>
                <View style={[styles.modalInputGroup, { flex: 1 }]}>
                  <Text style={styles.modalInputLabel}>Price To (₹)</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="7000"
                    keyboardType="numeric"
                    value={newPriceTo}
                    onChangeText={setNewPriceTo}
                  />
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleCreateNewProcedure}
                disabled={isSubmittingNew}
                style={styles.modalSaveBtn}
              >
                {isSubmittingNew ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSaveBtnText}>Add Procedure to Knowledge Base</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 6,
  },
  headerTitleBox: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: typography.fontSizes.bodyLarge,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.micro,
    color: colors.textSecondary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  addBtnText: {
    fontSize: typography.fontSizes.micro + 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.textInverse,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Info Banner
  kbInfoBanner: {
    backgroundColor: '#FAF6EE',
    borderWidth: 1.5,
    borderColor: '#E8D29F',
    borderRadius: borderRadius.lg,
    padding: 14,
    marginBottom: 14,
  },
  kbInfoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  kbInfoTitle: {
    fontSize: typography.fontSizes.caption + 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
  kbInfoDesc: {
    fontSize: typography.fontSizes.micro + 1,
    color: colors.textSecondary,
    lineHeight: 17,
  },

  // Search Box
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSizes.body - 1,
    color: colors.text,
    padding: 0,
  },

  // Category Chips
  categoriesRow: {
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.textInverse,
    fontWeight: typography.fontWeights.bold,
  },

  // Procedures List
  proceduresList: {
    gap: 12,
  },
  procCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  procCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  procCategoryBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  procCategoryBadgeText: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.bold,
    color: colors.textSecondary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: typography.fontSizes.micro,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  procName: {
    fontSize: typography.fontSizes.bodyLarge - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 4,
  },
  procDesc: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSubtle,
    padding: 10,
    borderRadius: borderRadius.md,
  },
  priceDisplay: {},
  priceLabel: {
    fontSize: typography.fontSizes.micro,
    color: colors.textMuted,
    fontWeight: typography.fontWeights.bold,
    textTransform: 'uppercase',
  },
  priceValue: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginTop: 1,
  },
  priceUnit: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.regular,
  },
  editPriceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  editPriceBtnText: {
    fontSize: typography.fontSizes.micro + 0.5,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
  notOfferedBox: {
    backgroundColor: colors.surfaceSubtle,
    padding: 8,
    borderRadius: borderRadius.sm,
  },
  notOfferedText: {
    fontSize: typography.fontSizes.micro + 0.5,
    color: colors.textMuted,
    fontStyle: 'italic',
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
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  modalSheetLarge: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalHeaderTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
  },
  modalClose: {
    padding: 6,
  },
  modalProcedureName: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
    marginBottom: 14,
  },
  modalSubtitle: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  modalScroll: {
    marginBottom: 10,
  },
  modalInputGroup: {
    marginBottom: 12,
  },
  modalInputLabel: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 4,
  },
  modalTextInput: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: typography.fontSizes.body - 1,
    color: colors.text,
  },
  pricingInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
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
  modalSaveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  modalSaveBtnText: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.textInverse,
  },
});
