import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";

export type Language = 
  | 'en' | 'hi' | 'bn' | 'te' | 'mr' | 'ta' | 'ur' | 'gu' | 'kn' | 'ml' 
  | 'or' | 'pa' | 'as' | 'mai' | 'ks' | 'ne' | 'kok' | 'sd' | 'doi' 
  | 'mni' | 'brx' | 'sa' | 'sat';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateDynamic: (text: string) => Promise<string>;
}

const initialTranslations: Record<string, Record<string, string>> = {
  en: {
    home: "Home",
    latestJobs: "Latest Jobs",
    latestUpdates: "Latest Updates",
    latestUpdatesDesc: "The very latest notifications across all categories",
    admitCard: "Admit Card",
    results: "Results",
    scholarships: "Scholarships",
    searchPlaceholder: "Search jobs, admit cards, results, scholarships...",
    feedback: "Feedback",
    saved: "Saved",
    alerts: "Alerts",
    admin: "Admin",
    features: "Features",
    login: "Login",
    logout: "Logout",
    allUpdates: "All Updates",
    allIndia: "All India (Central)",
    selectState: "Select Your State",
    stateLabel: "State",
    stateSelectionNotice: "Select your State for best updates in your state.",
    updatesFound: "Updates Found",
    noUpdates: "No updates found at the moment.",
    viewAll: "View all updates",
    savePreference: "Save Preference?",
    savePreferenceDesc: "Would you like to continue with updates from {state} in the future?",
    yes: "Yes",
    no: "No",
    shareFeedback: "Share Feedback",
    whatsOnMind: "What's on your mind?",
    experience: "Experience",
    suggestion: "Suggestion",
    issue: "Issue",
    message: "Message",
    sendFeedback: "Send Feedback",
    feedbackHelp: "Your feedback helps us improve the experience for all students.",
    enterMessage: "Please enter a message",
    feedbackSuccess: "Thank you for your feedback!",
    feedbackError: "Failed to submit feedback. Please try again.",
    issuePlaceholder: "Describe the problem you encountered...",
    suggestionPlaceholder: "What features would you like to see?",
    experiencePlaceholder: "Tell us about your experience with the app...",
    featuredUpdates: "Featured Updates",
    organization: "Organization",
    totalPosts: "Total Posts",
    stateRegion: "State / Region",
    importantDates: "Important Dates",
    details: "Details",
    applyNow: "Apply / View Official Notice",
    ageLimit: "Age Limit & Eligibility",
    checkEligibility: "Check Eligibility",
    backToUpdates: "Back to Updates",
    stepByStep: "Step-by-Step Application Guide",
    eligible: "Eligible",
    ineligible: "Ineligible",
    congrats: "Congratulations! You are eligible for this form.",
    sorry: "Sorry, you do not meet the age criteria for this form.",
    ageToday: "Your Age (Today)",
    ageCutoff: "Age at Cut-off Date",
    day: "Day",
    month: "Month",
    year: "Year",
    search: "Search",
    allTypes: "All Types",
    jobs: "Jobs",
    results_tab: "Results",
    admit_cards_tab: "Admit Cards",
    featured: "Featured",
    actions: "Actions",
    title: "Title",
    type: "Type",
    created: "Created",
    deleteSelected: "Delete Selected",
    searchUpdates: "Search updates...",
    allStates: "All States",
    new: "New",
    start: "Start",
    end: "End",
    released: "Released",
    selectLanguage: "Select Language",
    changeLanguage: "Change Language",
    profile: "Profile",
    posts: "Posts",
    shareText: "Check out this update: {title} from {org}",
    linkCopied: "Link copied to clipboard!",
    viewDetails: "View Details",
    importantNote: "Important Note",
    adminStateNote: "Updates added with a specific state (e.g., Bihar) will only show on the Home page when that state is selected or when 'All India' is selected. Ensure you select the correct state for your update.",
    manageUpdates: "Manage Updates",
    viewOnSite: "View on Site",
    markFeatured: "Mark as Featured",
    removeFeatured: "Remove Featured",
    confirmDeleteUpdate: "Are you sure you want to delete this update?",
    confirmBatchDelete: "Are you sure you want to delete {count} updates?",
    editingUpdate: "Editing update...",
    formReset: "Form reset to new update",
    itemsSelected: "items selected",
    readMore: "Read More",
    adminLogin: "Admin Login",
    adminLoginDesc: "Please sign in with your administrator account to access this panel.",
    signInWithGoogle: "Sign in with Google",
    accessDenied: "Access Denied",
    accessDeniedDesc: "The account",
    noAdminPrivileges: "does not have administrator privileges.",
    signOut: "Sign out",
    backToHome: "Back to Home",
    adminDashboard: "Admin Dashboard",
    adminDashboardDesc: "Manage site content and updates",
    adminFeatures: "Admin Features",
    editUpdate: "Edit Update",
    addNewUpdate: "Add New Update",
    cancelEdit: "Cancel Edit",
    thumbnailImage: "Thumbnail Image (Optional)",
    generateWithAI: "Generate with AI",
    uploadThumbnail: "Upload Thumbnail",
    changeThumbnail: "Change Thumbnail",
    aiGenerating: "AI is generating thumbnails...",
    selectAIVariation: "Select an AI variation",
    clear: "Clear",
    select: "Select",
    category: "Category",
    descriptionDetails: "Description / Details",
    officialUrl: "Official URL",
    ageLimitNoticeDate: "Age Limit Notice Date",
    eligibilityNoticeText: "Eligibility Notice Text",
    publishUpdate: "Publish Update",
    saveChanges: "Save Changes",
    stepsToApply: "Steps to Apply",
    addStep: "Add Step",
    step: "Step",
    removeStep: "Remove Step",
    moveUp: "Move Up",
    moveDown: "Move Down",
    uploadImage: "Upload Image",
    changeImage: "Change Image",
    preview: "Preview",
    updatesList: "Updates List",
    batchDelete: "Batch Delete",
    confirmDelete: "Confirm Delete",
    deleteConfirmDesc: "Are you sure you want to delete this update? This action cannot be undone.",
    cancel: "Cancel",
    delete: "Delete",
    ageLimitNotice: "The date by which the age must be met (e.g. 01/01/2026).",
    featuredNotice: "Featured updates appear at the top of the home page",
    adminSecurity: "Admin Security",
    adminSecurityNotice: "This panel is restricted to authorized administrators only. All actions are logged and secured by Firestore Security Rules.",
    contentManagement: "Content Management",
    admitCards: "Admit Cards",
    noUpdatesFound: "No updates found matching your criteria",
    removeFromFeatured: "Remove from featured",
    viewOfficialLink: "View Official Link",
    deleteUpdate: "Delete Update",
    batchDeleteConfirm: "Are you sure you want to delete {count} selected updates? This action cannot be undone.",
    deleteConfirm: "Are you sure you want to delete this update? This action cannot be undone.",
    deleteNow: "Delete Now",
    guidePreview: "Guide Preview",
    noInstructions: "No instructions provided for this step.",
    closePreview: "Close Preview",
    quickStats: "Quick Stats",
    totalUpdates: "Total Updates",
    instructions: "Instructions",
    stepImage: "Step Image",
    noStepsAdded: "No steps added yet. Click \"Add Step\" to create a guide.",
    markAsFeatured: "Mark as Featured Update",
    startDate: "Start Date",
    endDate: "End Date",
    updateDate: "Update Date",
    releaseDate: "Release Date",
    batchDeleteSuccess: "{count} updates deleted successfully!",
    updateDeleted: "Update deleted",
    failedDelete: "Failed to delete",
    updateModifiedSuccess: "Update modified successfully!",
    updatePublishedSuccess: "Update published successfully!",
    failedPublish: "Failed to publish update. Check console for details.",
    thumbnailUploaded: "Thumbnail uploaded",
    failedProcessImage: "Failed to process image",
    geminiKeyMissing: "Gemini API Key is missing",
    aiVariationsGenerated: "AI variations generated!",
    noAiVariations: "No variations generated by AI",
    failedAiVariations: "Failed to generate AI variations",
    enterTitleCategory: "Please enter a title and category first",
    defaultThumbnailsGenerated: "Default thumbnails generated!",
    failedDefaultThumbnail: "Failed to generate default thumbnail",
    stepImageUploaded: "Step {index} image uploaded",
    updateMarkedFeatured: "Update marked as featured",
    updateRemovedFeatured: "Update removed from featured",
    failedUpdateFeatured: "Failed to update featured status",
    aiThumbnailSelected: "AI thumbnail selected!",
    adminFeaturesDesc: "Advanced management tools and settings",
    backToDashboard: "Back to Dashboard",
    userManagement: "User Management",
    userManagementDesc: "Manage user roles, permissions, and account status.",
    contentModeration: "Content Moderation",
    contentModerationDesc: "Review and moderate user-submitted content and feedback.",
    systemSettings: "System Settings",
    systemSettingsDesc: "Configure global application settings and maintenance mode.",
    comingSoon: "Coming Soon",
    futureRoadmap: "Future Roadmap",
    futureRoadmapDesc: "We are working on expanding the admin capabilities to include real-time analytics, automated notification broadcasting, and advanced data export tools. Stay tuned for updates!",
    siteUnderMaintenance: "Site Under Maintenance",
    maintenanceDesc: "We're currently performing some scheduled updates to improve your experience. We'll be back online shortly!",
    estimatedTime: "Estimated Time",
    backSoon: "Our team is working hard to bring you new features.",
    notificationSettings: "Notification Settings",
    pushNotifications: "Push Notifications",
    pushNotificationsDesc: "Enable or disable all notifications from Update Students",
    notifyMeAbout: "Notify me about",
    privacyNote: "We respect your privacy. Your notification preferences are stored securely and used only to send you relevant updates based on your choices. You can change these settings at any time.",
    savePreferences: "Save Preferences",
    preferencesSaved: "Notification preferences saved successfully!",
    failedSavePreferences: "Failed to save preferences",
    loginToAccessSettings: "Please login to access notification settings",
    failedLoadSettings: "Failed to load settings",
    savedUpdates: "Saved Updates",
    loginToViewSaved: "Please login to view saved updates",
    recentlySaved: "Recently Saved",
    titleAZ: "Title (A-Z)",
    noSavedUpdatesMatch: "No saved updates match your filter.",
    clearFilter: "Clear Filter",
    noSavedUpdatesYet: "You haven't saved any updates yet.",
    browseLatestUpdates: "Browse Latest Updates",
    updateNotFound: "Update not found",
    save: "Save",
    share: "Share",
    lastUpdated: "Last Updated",
    release: "Release",
    translating: "Translating...",
    ageCutoffNote: "Note: Age will be calculated as on {date}. Candidates must meet the criteria by this specific date.",
    eligibleMsg: "Congratulations! You are eligible for this form.",
    ineligibleMsg: "Sorry, you do not meet the age criteria for this form.",
    ineligibleNoticeMsg: "You meet the age criteria today, but you were not eligible as per the department's cut-off date. Therefore, you are ineligible.",
    years: "Years",
    months: "Months",
    days: "Days",
    featuredUpdate: "Featured Update",
    removeBookmark: "Remove Bookmark",
    saveUpdate: "Save Update",
    shareUpdate: "Share Update",
    preferenceSaved: "Preference saved: {state}",
    failedSavePreference: "Failed to save preference",
    latestNotificationsFor: "Latest notifications and updates for {category}",
    job: "Job",
    admit_card: "Admit Card",
    result: "Result",
    scholarship: "Scholarship",
    aboutUs: "About Us",
    contactUs: "Contact Us",
    privacyPolicy: "Privacy Policy",
    meetTheDeveloper: "Meet the Developer",
    followUs: "Follow Us",
    allRightsReserved: "All Rights Reserved",
    copyright: "© {year} Update Students.",
    aboutDesc: "Update Students is your one-stop destination for the latest educational updates, including jobs, admit cards, results, and scholarships. Our mission is to empower students with timely and accurate information to help them succeed in their academic and professional journeys.",
    contactDesc: "Have questions or feedback? We'd love to hear from you. Reach out to us through any of the platforms below or send us a message directly.",
    privacyDesc: "Your privacy is important to us. This policy explains how we collect, use, and protect your personal information when you use our services.",
    developerDesc: "Hi, I'm the developer behind Update Students. I'm passionate about building tools that make a difference in people's lives. Thank you for using my app!",
    socialLinks: "Social Links",
    manageSocialLinks: "Manage Social Links",
    platform: "Platform",
    link: "Link",
    displayName: "Display Name",
    updateLinks: "Update Links",
    linksUpdated: "Social links updated successfully!",
    failedUpdateLinks: "Failed to update social links",
    requiredDocuments: "Required Documents",
    addDocument: "Add Document",
    removeDocument: "Remove",
    documentPlaceholder: "e.g. Aadhar Card, 10th Marksheet...",
    applicationFee: "Application Fee",
    fee: "Fee",
    addFee: "Add Fee",
    postVacancies: "Post-wise Vacancies",
    postName: "Post Name",
    vacancies: "Vacancies",
    addPost: "Add Post",
    disclaimer: "Disclaimer",
    disclaimerText: "Disclaimer: Users are advised to use this website for informational purposes only. Any attempt to scrape data, misuse the platform, or engage in activities that harm the website's integrity is strictly prohibited. Always verify information from official sources.",
    tools: "Tools",
    imageCompressor: "Image Compressor",
    imageCompressorDesc: "Resize, crop, and compress your passport size photos.",
    signatureResizer: "Signature Resizer",
    signatureResizerDesc: "Crop and resize your signature images perfectly.",
    pdfCompressor: "PDF Compressor",
    pdfCompressorDesc: "Reduce the file size of your PDF documents.",
    imageToPdf: "Image to PDF",
    imageToPdfDesc: "Convert JPG, PNG images into a single PDF file.",
    uploadPdf: "Upload PDF",
    download: "Download",
    compress: "Compress",
    resize: "Resize",
    crop: "Crop",
    width: "Width (px)",
    height: "Height (px)",
    targetSize: "Target Size (KB)",
    convert: "Convert to PDF",
    addMoreImages: "Add More Images",
    processing: "Processing...",
    success: "Success!",
    error: "An error occurred.",
    quiz: "Quiz",
    quizHistory: "Quiz History",
    viewPastPerformance: "Track your progress and review past quiz attempts",
    noHistoryFound: "No Quiz History Found",
    startQuizToSeeHistory: "Take a quiz to see your results here!",
    back: "Back",
    selectOrg: "Select Organization",
    selectYear: "Select Year",
    startQuiz: "Start Quiz",
    loginRequiredForMoreQuiz: "Please login to take more quizzes.",
    quizDisclaimer: "These answers are AI-generated, please cross-check. Thank you for taking the quiz.",
    timeTaken: "Time Taken",
    score: "Score",
    correct: "Correct",
    wrong: "Wrong",
    unanswered: "Unanswered",
    submitQuiz: "Submit Quiz",
    uploadQuizMaterial: "Upload Quiz Material",
    generateQuiz: "Generate Quiz",
    generatingQuiz: "Generating Quiz...",
    quizManagement: "Quiz Management",
    quizManagementDesc: "Upload question papers to generate quizzes.",
    next: "Next",
    question: "Question",
    of: "of",
    uploadPdfOrImage: "Upload PDF or Images",
    quizGeneratedSuccess: "Quiz generated successfully!",
    quizGenerationFailed: "Failed to generate quiz.",
    quizSavedSuccess: "Quiz saved successfully!",
    quizSaveFailed: "Failed to save quiz.",
    noQuizzesFound: "No quizzes found for this selection.",
    generatingQuestions: "AI is analyzing and generating questions...",
    currentAffairs: "Current Affairs",
    exam: "Exam",
    quizType: "Quiz Type",
    generatedQuizzes: "Generated Quizzes",
    deleteQuiz: "Delete Quiz",
    aiAutoFill: "AI Auto-Fill Form",
    aiAutoFillDesc: "Paste an official URL and let AI extract all details and write the article for you.",
    targetUrl: "Official Website URL",
    targetUrlPlaceholder: "https://ssc.nic.in/...",
    jobTitle: "Update Title / Topic",
    jobTitlePlaceholder: "e.g. SSC CGL 2024",
    generateMagic: "Generate Magic ✨",
    fetchingUrl: "Fetching website data...",
    analyzingData: "AI is analyzing and writing content...",
    aiSuccess: "Form auto-filled successfully!",
    aiError: "Failed to extract data. The website might be blocking access or the URL is invalid."
  },
  hi: {
    home: "होम",
    latestJobs: "नवीनतम नौकरियां",
    latestUpdates: "नवीनतम अपडेट",
    latestUpdatesDesc: "सभी श्रेणियों में सबसे ताज़ा सूचनाएं",
    admitCard: "प्रवेश पत्र",
    results: "परिणाम",
    scholarships: "छात्रवृत्ति",
    searchPlaceholder: "नौकरियां, प्रवेश पत्र, परिणाम, छात्रवृत्ति खोजें...",
    feedback: "फीडबैक",
    saved: "सेव किया गया",
    alerts: "अलर्ट",
    admin: "एडमिन",
    features: "फीचर्स",
    login: "लॉगिन",
    logout: "लॉगआउट",
    allUpdates: "सभी अपडेट",
    allIndia: "अखिल भारतीय (केंद्रीय)",
    selectState: "अपना राज्य चुनें",
    stateLabel: "राज्य",
    stateSelectionNotice: "अपने राज्य में सर्वोत्तम अपडेट के लिए अपना राज्य चुनें।",
    updatesFound: "अपडेट मिले",
    noUpdates: "फिलहाल कोई अपडेट नहीं मिला।",
    viewAll: "सभी अपडेट देखें",
    savePreference: "प्राथमिकता सहेजें?",
    savePreferenceDesc: "क्या आप भविष्य में {state} के अपडेट जारी रखना चाहेंगे?",
    yes: "हाँ",
    no: "नहीं",
    shareFeedback: "प्रतिक्रिया साझा करें",
    whatsOnMind: "आपके मन में क्या है?",
    experience: "अनुभव",
    suggestion: "सुझाव",
    issue: "समस्या",
    message: "संदेश",
    sendFeedback: "प्रतिक्रिया भेजें",
    feedbackHelp: "आपकी प्रतिक्रिया हमें सभी छात्रों के लिए अनुभव को बेहतर बनाने में मदद करती है।",
    enterMessage: "कृपया एक संदेश दर्ज करें",
    feedbackSuccess: "आपकी प्रतिक्रिया के लिए धन्यवाद!",
    feedbackError: "प्रतिक्रिया सबमिट करने में विफल। कृपया पुनः प्रयास करें।",
    issuePlaceholder: "आपके द्वारा सामना की गई समस्या का वर्णन करें...",
    suggestionPlaceholder: "आप कौन सी सुविधाएँ देखना चाहेंगे?",
    experiencePlaceholder: "हमें ऐप के साथ अपने अनुभव के बारे में बताएं...",
    featuredUpdates: "विशेष अपडेट",
    organization: "संगठन",
    totalPosts: "कुल पद",
    stateRegion: "राज्य / क्षेत्र",
    importantDates: "महत्वपूर्ण तिथियां",
    details: "विवरण",
    applyNow: "आवेदन करें / आधिकारिक सूचना देखें",
    ageLimit: "आयु सीमा और पात्रता",
    checkEligibility: "पात्रता जांचें",
    backToUpdates: "अपडेट पर वापस जाएं",
    stepByStep: "चरण-दर-चरण आवेदन गाइड",
    eligible: "पात्र",
    ineligible: "अपात्र",
    congrats: "बधाई हो! आप इस फॉर्म के लिए पात्र हैं।",
    sorry: "क्षमा करें, आप इस फॉर्म के लिए आयु मानदंडों को पूरा नहीं करते हैं।",
    ageToday: "आपकी आयु (आज)",
    ageCutoff: "कट-ऑफ तिथि पर आयु",
    day: "दिन",
    month: "महीना",
    year: "वर्ष",
    search: "खोजें",
    allTypes: "सभी प्रकार",
    jobs: "नौकरियां",
    results_tab: "परिणाम",
    admit_cards_tab: "प्रवेश पत्र",
    featured: "विशेष",
    actions: "कार्रवाई",
    title: "शीर्षक",
    type: "प्रकार",
    created: "बनाया गया",
    deleteSelected: "चयनित हटाएं",
    searchUpdates: "अपडेट खोजें...",
    allStates: "सभी राज्य",
    new: "नया",
    start: "शुरू",
    end: "समाप्त",
    released: "जारी",
    selectLanguage: "भाषा चुनें",
    changeLanguage: "भाषा बदलें",
    profile: "प्रोफ़ाइल",
    posts: "पद",
    shareText: "इस अपडेट को देखें: {org} से {title}",
    linkCopied: "लिंक क्लिपबोर्ड पर कॉपी किया गया!",
    viewDetails: "विवरण देखें",
    readMore: "और पढ़ें",
    aboutUs: "हमारे बारे में",
    contactUs: "संपर्क करें",
    privacyPolicy: "गोपनीयता नीति",
    meetTheDeveloper: "डेवलपर से मिलें",
    followUs: "हमें फॉलो करें",
    allRightsReserved: "सर्वाधिकार सुरक्षित",
    copyright: "© {year} Update Students.",
    aboutDesc: "Update Students नवीनतम शैक्षिक अपडेट के लिए आपका वन-स्टॉप गंतव्य है, जिसमें नौकरियां, एडमिट कार्ड, परिणाम और छात्रवृत्ति शामिल हैं। हमारा मिशन छात्रों को उनके शैक्षणिक और व्यावसायिक जीवन में सफल होने में मदद करने के लिए समय पर और सटीक जानकारी प्रदान करना है।",
    contactDesc: "कोई प्रश्न या प्रतिक्रिया है? हमें आपसे सुनना अच्छा लगेगा। नीचे दिए गए किसी भी प्लेटफॉर्म के माध्यम से हमसे संपर्क करें या हमें सीधे संदेश भेजें।",
    privacyDesc: "आपकी गोपनीयता हमारे लिए महत्वपूर्ण है। यह नीति बताती है कि जब आप हमारी सेवाओं का उपयोग करते हैं तो हम आपकी व्यक्तिगत जानकारी को कैसे एकत्र, उपयोग और सुरक्षित करते हैं।",
    developerDesc: "नमस्ते, मैं Update Students के पीछे का डेवलपर हूं। मैं ऐसे उपकरण बनाने के लिए उत्साहित हूं जो लोगों के जीवन में बदलाव लाते हैं। मेरे ऐप का उपयोग करने के लिए धन्यवाद!",
    socialLinks: "सोशल लिंक",
    manageSocialLinks: "सोशल लिंक प्रबंधित करें",
    platform: "प्लेटफॉर्म",
    link: "लिंक",
    displayName: "डिस्प्ले नाम",
    updateLinks: "लिंक अपडेट करें",
    linksUpdated: "सोशल लिंक सफलतापूर्वक अपडेट किए गए!",
    failedUpdateLinks: "सोशल लिंक अपडेट करने में विफल",
    requiredDocuments: "आवश्यक दस्तावेज",
    addDocument: "दस्तावेज जोड़ें",
    removeDocument: "हटाएं",
    documentPlaceholder: "जैसे आधार कार्ड, 10वीं की मार्कशीट...",
    applicationFee: "आवेदन शुल्क",
    fee: "शुल्क",
    addFee: "शुल्क जोड़ें",
    postVacancies: "पद-वार रिक्तियां",
    postName: "पद का नाम",
    vacancies: "रिक्तियां",
    addPost: "पद जोड़ें",
    disclaimer: "अस्वीकरण",
    disclaimerText: "अस्वीकरण: उपयोगकर्ताओं को सलाह दी जाती है कि वे इस वेबसाइट का उपयोग केवल सूचनात्मक उद्देश्यों के लिए करें। डेटा स्क्रैप करने, प्लेटफॉर्म का दुरुपयोग करने या वेबसाइट की अखंडता को नुकसान पहुंचाने वाली गतिविधियों में शामिल होने का कोई भी प्रयास सख्त वर्जित है। हमेशा आधिकारिक स्रोतों से जानकारी सत्यापित करें।",
    tools: "उपकरण",
    imageCompressor: "छवि कंप्रेसर",
    imageCompressorDesc: "अपनी पासपोर्ट आकार की तस्वीरों का आकार बदलें, क्रॉप करें और कंप्रेस करें।",
    signatureResizer: "हस्ताक्षर रिसाइज़र",
    signatureResizerDesc: "अपने हस्ताक्षर छवियों को पूरी तरह से क्रॉप और आकार दें।",
    pdfCompressor: "पीडीएफ कंप्रेसर",
    pdfCompressorDesc: "अपने पीडीएफ दस्तावेजों का फ़ाइल आकार कम करें।",
    imageToPdf: "छवि से पीडीएफ",
    imageToPdfDesc: "जेपीजी, पीएनजी छवियों को एक पीडीएफ फ़ाइल में बदलें।",
    uploadPdf: "पीडीएफ अपलोड करें",
    download: "डाउनलोड",
    compress: "कंप्रेस करें",
    resize: "आकार बदलें",
    crop: "क्रॉप करें",
    width: "चौड़ाई (px)",
    height: "ऊंचाई (px)",
    targetSize: "लक्ष्य आकार (KB)",
    convert: "पीडीएफ में बदलें",
    addMoreImages: "और छवियां जोड़ें",
    processing: "प्रसंस्करण...",
    success: "सफलता!",
    error: "एक त्रुटि हुई।",
    quizHistory: "क्विज़ इतिहास",
    viewPastPerformance: "अपनी प्रगति को ट्रैक करें और पिछले क्विज़ प्रयासों की समीक्षा करें",
    noHistoryFound: "कोई क्विज़ इतिहास नहीं मिला",
    startQuizToSeeHistory: "अपने परिणाम यहां देखने के लिए एक क्विज़ लें!",
    back: "पीछे",
    siteUnderMaintenance: "साइट रखरखाव के अधीन है",
    maintenanceDesc: "हम वर्तमान में आपके अनुभव को बेहतर बनाने के लिए कुछ निर्धारित अपडेट कर रहे हैं। हम जल्द ही वापस ऑनलाइन होंगे!",
    estimatedTime: "अनुमानित समय",
    backSoon: "हमारी टीम आपको नई सुविधाएँ देने के लिए कड़ी मेहनत कर रही है।",
    aiAutoFill: "AI ऑटो-फिल फॉर्म",
    aiAutoFillDesc: "आधिकारिक URL पेस्ट करें और AI को सभी विवरण निकालने और आपके लिए लेख लिखने दें।",
    targetUrl: "आधिकारिक वेबसाइट URL",
    targetUrlPlaceholder: "https://ssc.nic.in/...",
    jobTitle: "अपडेट शीर्षक / विषय",
    jobTitlePlaceholder: "उदा. SSC CGL 2024",
    generateMagic: "मैजिक जनरेट करें ✨",
    fetchingUrl: "वेबसाइट डेटा प्राप्त किया जा रहा है...",
    analyzingData: "AI सामग्री का विश्लेषण और लेखन कर रहा है...",
    aiSuccess: "फॉर्म सफलतापूर्वक ऑटो-फिल हो गया!",
    aiError: "डेटा निकालने में विफल। वेबसाइट एक्सेस को ब्लॉक कर रही हो सकती है या URL अमान्य है।"
  },
  bn: {
    home: "হোম",
    latestJobs: "সাম্প্রতিক চাকরি",
    admitCard: "অ্যাডমিট কার্ড",
    results: "ফলাফল",
    scholarships: "স্কলারশিপ",
    searchPlaceholder: "চাকরি, অ্যাডমিট কার্ড, ফলাফল খুঁজুন...",
    feedback: "ফিডব্যাক",
    saved: "সংরক্ষিত",
    alerts: "অ্যালার্ট",
    admin: "অ্যাডমিন",
    features: "ফিচার",
    login: "লগইন",
    logout: "লগআউট",
    allUpdates: "সব আপডেট",
    updatesFound: "আপডেট পাওয়া গেছে",
    noUpdates: "এই মুহূর্তে কোনো আপডেট নেই।",
    viewAll: "সব আপডেট দেখুন",
    featuredUpdates: "সেরা আপডেট",
    organization: "সংস্থা",
    totalPosts: "মোট পদ",
    stateRegion: "রাজ্য / অঞ্চল",
    importantDates: "গুরুত্বপূর্ণ তারিখ",
    details: "বিস্তারিত",
    applyNow: "আবেদন করুন / অফিসিয়াল নোটিশ দেখুন",
    ageLimit: "বয়স সীমা ও যোগ্যতা",
    checkEligibility: "যোগ্যতা যাচাই করুন",
    backToUpdates: "তালিকায় ফিরে যান",
    stepByStep: "ধাপে ধাপে আবেদন গাইড",
    eligible: "যোগ্য",
    ineligible: "অযোগ্য",
    congrats: "অভিনন্দন! আপনি এই ফর্মের জন্য যোগ্য।",
    sorry: "দুঃখিত, আপনি এই ফর্মের জন্য বয়স সীমা পূরণ করেন না।",
    ageToday: "আপনার বয়স (আজ)",
    ageCutoff: "কাট-অফ তারিখে বয়স",
    day: "দিন",
    month: "মাস",
    year: "বছর",
    search: "খুঁজুন",
    allTypes: "সব ধরন",
    jobs: "চাকরি",
    results_tab: "ফলাফল",
    admit_cards_tab: "অ্যাডমিট কার্ড",
    featured: "সেরা",
    actions: "অ্যাকশন",
    title: "শিরোনাম",
    type: "ধরন",
    created: "তৈরি",
    deleteSelected: "নির্বাচিত মুছুন",
    searchUpdates: "আপডেট খুঁজুন...",
    allStates: "সব রাজ্য",
    new: "নতুন",
    start: "শুরু",
    end: "শেষ",
    released: "প্রকাশিত",
    viewDetails: "বিস্তারিত দেখুন",
    readMore: "আরও পড়ুন",
    siteUnderMaintenance: "সাইট রক্ষণাবেক্ষণের অধীনে রয়েছে",
    maintenanceDesc: "আপনার অভিজ্ঞতা উন্নত করার জন্য আমরা বর্তমানে কিছু নির্ধারিত আপডেট করছি। আমরা শীঘ্রই অনলাইনে ফিরে আসব!",
    estimatedTime: "আনুমানিক সময়",
    backSoon: "আমাদের দল আপনাকে নতুন বৈশিষ্ট্য আনতে কঠোর পরিশ্রম করছে।",
    aiAutoFill: "AI অটো-ফিল ফর্ম",
    aiAutoFillDesc: "অফিসিয়াল URL পেস্ট করুন এবং AI কে সমস্ত বিবরণ বের করতে এবং আপনার জন্য নিবন্ধ লিখতে দিন।",
    targetUrl: "অফিসিয়াল ওয়েবসাইট URL",
    targetUrlPlaceholder: "https://ssc.nic.in/...",
    jobTitle: "আপডেট শিরোনাম / বিষয়",
    jobTitlePlaceholder: "যেমন SSC CGL 2024",
    generateMagic: "ম্যাজিক জেনারেট করুন ✨",
    fetchingUrl: "ওয়েবসাইট ডেটা আনা হচ্ছে...",
    analyzingData: "AI বিষয়বস্তু বিশ্লেষণ এবং লিখছে...",
    aiSuccess: "ফর্ম সফলভাবে অটো-ফিল হয়েছে!",
    aiError: "ডেটা বের করতে ব্যর্থ। ওয়েবসাইট অ্যাক্সেস ব্লক করতে পারে বা URL অবৈধ।"
  },
  te: {
    home: "హోమ్",
    latestJobs: "తాజా ఉద్యోగాలు",
    admitCard: "అడ్మిట్ కార్డ్",
    results: "ఫలితాలు",
    scholarships: "స్కాలర్‌షిప్‌లు",
    searchPlaceholder: "ఉద్యోగాలు, అడ్మిట్ కార్డ్‌లు, ఫలితాల కోసం వెతకండి...",
    feedback: "ఫీడ్‌బ్యాక్",
    saved: "సేవ్ చేయబడింది",
    alerts: "అలర్ట్స్",
    admin: "అడ్మిన్",
    features: "ఫీచర్లు",
    login: "లాగిన్",
    logout: "లాగ్అవుట్",
    allUpdates: "అన్ని అప్‌డేట్లు",
    updatesFound: "అప్‌డేట్లు కనుగొనబడ్డాయి",
    noUpdates: "ప్రస్తుతానికి అప్‌డేట్లు లేవు.",
    viewAll: "అన్ని అప్‌డేట్లు చూడండి",
    featuredUpdates: "ముఖ్యమైన అప్‌డేట్లు",
    organization: "సంస్థ",
    totalPosts: "మొత్తం పోస్టులు",
    stateRegion: "రాష్ట్రం / ప్రాంతం",
    importantDates: "ముఖ్యమైన తేదీలు",
    details: "వివరాలు",
    applyNow: "దరఖాస్తు చేసుకోండి / నోటీసు చూడండి",
    ageLimit: "వయోపరిమితి & అర్హత",
    checkEligibility: "అర్హతను తనిఖీ చేయండి",
    backToUpdates: "తిరిగి వెళ్ళండి",
    stepByStep: "దరఖాస్తు గైడ్",
    eligible: "అర్హులు",
    ineligible: "అనర్హులు",
    congrats: "అభినందనలు! మీరు ఈ ఫారమ్‌కు అర్హులు.",
    sorry: "క్షమించండి, మీరు వయోపరిమితిని చేరుకోలేదు.",
    ageToday: "మీ వయస్సు (నేడు)",
    ageCutoff: "కటాఫ్ తేదీ నాటికి వయస్సు",
    day: "రోజు",
    month: "నెల",
    year: "సంవత్సరం",
    search: "వెతకండి",
    allTypes: "అన్ని రకాలు",
    jobs: "ఉద్యోగాలు",
    results_tab: "ఫలితాలు",
    admit_cards_tab: "అడ్మిట్ కార్డ్‌లు",
    featured: "ముఖ్యమైనవి",
    actions: "చర్యలు",
    title: "శీర్షిక",
    type: "రకం",
    created: "సృష్టించబడింది",
    deleteSelected: "ఎంచుకున్నవి తొలగించు",
    searchUpdates: "అప్‌డేట్లు వెతకండి...",
    allStates: "అన్ని రాష్ట్రాలు",
    new: "కొత్త",
    start: "ప్రారంభం",
    end: "ముగింపు",
    released: "విడుదల",
    viewDetails: "వివరాలు చూడండి",
    readMore: "మరింత చదవండి",
  },
  mr: {
    home: "होम",
    latestJobs: "नवीनतम नोकऱ्या",
    admitCard: "प्रवेशपत्र",
    results: "निकाल",
    scholarships: "शिष्यवृत्ती",
    searchPlaceholder: "नोकऱ्या, प्रवेशपत्र, निकाल शोधा...",
    feedback: "फीडबॅक",
    saved: "सेव्ह केलेले",
    alerts: "अलर्ट",
    admin: "अ‍ॅडमिन",
    features: "वैशिष्ट्ये",
    login: "लॉगिन",
    logout: "लॉगआउट",
    allUpdates: "सर्व अपडेट्स",
    updatesFound: "अपडेट्स मिळाले",
    noUpdates: "सध्या कोणतेही अपडेट्स नाहीत.",
    viewAll: "सर्व अपडेट्स पहा",
    featuredUpdates: "वैशिष्ट्यपूर्ण अपडेट्स",
    organization: "संस्था",
    totalPosts: "एकूण पदे",
    stateRegion: "राज्य / प्रदेश",
    importantDates: "महत्वाच्या तारखा",
    details: "तपशील",
    applyNow: "अर्ज करा / अधिकृत नोटीस पहा",
    ageLimit: "वयोमर्यादा आणि पात्रता",
    checkEligibility: "पात्रता तपासा",
    backToUpdates: "परत जा",
    stepByStep: "अर्ज मार्गदर्शक",
    eligible: "पात्र",
    ineligible: "अपात्र",
    congrats: "अभिनंदन! आपण या फॉर्मसाठी पात्र आहात.",
    sorry: "क्षमस्व, आपण वयोमर्यादा पूर्ण करत नाही.",
    ageToday: "आपले वय (आज)",
    ageCutoff: "कट-ऑफ तारखेनुसार वय",
    day: "दिवस",
    month: "महिना",
    year: "वर्ष",
    search: "शोधा",
    allTypes: "सर्व प्रकार",
    jobs: "नोकऱ्या",
    results_tab: "निकाल",
    admit_cards_tab: "प्रवेशपत्र",
    featured: "वैशिष्ट्यपूर्ण",
    actions: "कृती",
    title: "शीर्षक",
    type: "प्रकार",
    created: "तयार केले",
    deleteSelected: "निवडलेले हटवा",
    searchUpdates: "अपडेट्स शोधा...",
    allStates: "सर्व राज्ये",
    new: "नवीन",
    start: "सुरुवात",
    end: "शेवट",
    released: "प्रसिद्ध",
    viewDetails: "तपशील पहा",
    readMore: "अधिक वाचा",
  },
  ta: {
    home: "முகப்பு",
    latestJobs: "சமீபத்திய வேலைகள்",
    admitCard: "நுழைவுச் சீட்டு",
    results: "முடிவுகள்",
    scholarships: "உதவித்தொகை",
    searchPlaceholder: "வேலைகள், நுழைவுச் சீட்டு, முடிவுகளைத் தேடுங்கள்...",
    feedback: "கருத்து",
    saved: "சேமிக்கப்பட்டது",
    alerts: "அறிவிப்புகள்",
    admin: "நிர்வாகி",
    features: "அம்சங்கள்",
    login: "உள்நுழை",
    logout: "வெளியேறு",
    allUpdates: "அனைத்து அறிவிப்புகள்",
    updatesFound: "அறிவிப்புகள் கிடைத்துள்ளன",
    noUpdates: "தற்போது அறிவிப்புகள் இல்லை.",
    viewAll: "அனைத்தையும் காண்க",
    featuredUpdates: "சிறப்பு அறிவிப்புகள்",
    organization: "நிறுவனம்",
    totalPosts: "மொத்த பணியிடங்கள்",
    stateRegion: "மாநிலம் / மண்டலம்",
    importantDates: "முக்கியமான தேதிகள்",
    details: "விவரங்கள்",
    applyNow: "விண்ணப்பிக்க / அறிவிப்பைப் பார்க்க",
    ageLimit: "வயது வரம்பு & தகுதி",
    checkEligibility: "தகுதியைச் சரிபார்க்கவும்",
    backToUpdates: "திரும்பிச் செல்ல",
    stepByStep: "விண்ணப்ப வழிகாட்டி",
    eligible: "தகுதியுடையவர்",
    ineligible: "தகுதியற்றவர்",
    congrats: "வாழ்த்துகள்! நீங்கள் விண்ணப்பிக்கத் தகுதியுடையவர்.",
    sorry: "மன்னிக்கவும், நீங்கள் வயது வரம்பைப் பூர்த்தி செய்யவில்லை.",
    ageToday: "உங்கள் வயது (இன்று)",
    ageCutoff: "கட்-ஆஃப் தேதியில் வயது",
    day: "நாள்",
    month: "மாதம்",
    year: "ஆண்டு",
    search: "தேடு",
    allTypes: "அனைத்து வகைகள்",
    jobs: "வேலைகள்",
    results_tab: "முடிவுகள்",
    admit_cards_tab: "நுழைவுச் சீட்டு",
    featured: "சிறப்பு",
    actions: "செயல்கள்",
    title: "தலைப்பு",
    type: "வகை",
    created: "உருவாக்கப்பட்டது",
    deleteSelected: "தேர்ந்தெடுத்ததை நீக்கு",
    searchUpdates: "அறிவிப்புகளைத் தேடு...",
    allStates: "அனைத்து மாநிலங்கள்",
    new: "புதிய",
    start: "தொடக்கம்",
    end: "முடிவு",
    released: "வெளியிடப்பட்டது",
    viewDetails: "விவரங்களைக் காண்க",
    readMore: "மேலும் படிக்க",
  },
  ur: {}, gu: {}, kn: {}, ml: {}, or: {}, pa: {}, as: {}, mai: {}, ks: {}, ne: {}, kok: {}, sd: {}, doi: {}, mni: {}, brx: {}, sa: {}, sat: {}
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('preferredLanguage');
    return (saved as Language) || 'en';
  });

  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>(() => {
    const saved = localStorage.getItem('cachedTranslations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with initial to ensure new keys are present
        const merged = { ...initialTranslations };
        Object.keys(parsed).forEach(lang => {
          merged[lang] = { ...merged[lang], ...parsed[lang] };
        });
        return merged;
      } catch (e) {
        return initialTranslations;
      }
    }
    return initialTranslations;
  });

  const [isTranslating, setIsTranslating] = useState(false);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  // Function to translate a single text
  const translateDynamic = useCallback(async (text: string): Promise<string> => {
    if (!text || language === 'en') return text;
    
    // Check cache first
    const cacheKey = `dyn_${language}_${text}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Translate the following text to ${language}. Return ONLY the translated text, nothing else. Text: "${text}"`,
      });
      const translated = response.text.trim().replace(/^"|"$/g, '') || text;
      localStorage.setItem(cacheKey, translated);
      return translated;
    } catch (error) {
      console.error("Dynamic translation error:", error);
      return text;
    }
  }, [language]);

  // Background translation for missing keys
  useEffect(() => {
    if (language === 'en' || isTranslating) return;

    const missingKeys = Object.keys(translations.en).filter(
      key => !translations[language]?.[key] || translations[language][key] === translations.en[key]
    );

    if (missingKeys.length === 0) return;

    const translateMissing = async () => {
      setIsTranslating(true);
      const newTranslations = { ...translations };
      if (!newTranslations[language]) newTranslations[language] = {};

      // Translate in batches of 10 to avoid long prompts and speed up
      const batchSize = 10;
      for (let i = 0; i < missingKeys.length; i += batchSize) {
        const batch = missingKeys.slice(i, i + batchSize);
        const prompt = `Translate the following UI keys to ${language}. Return a JSON object where keys are the original keys and values are the translations.
        Keys to translate:
        ${JSON.stringify(batch.reduce((acc, key) => ({ ...acc, [key]: translations.en[key] }), {}), null, 2)}`;

        try {
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
          });
          
          const result = JSON.parse(response.text);
          Object.assign(newTranslations[language], result);
          
          // Update state incrementally for better UX
          setTranslations({ ...newTranslations });
          localStorage.setItem('cachedTranslations', JSON.stringify(newTranslations));
        } catch (error) {
          console.error("Batch translation error:", error);
          break; // Stop if error to avoid infinite loops
        }
      }
      setIsTranslating(false);
    };

    translateMissing();
  }, [language, translations]);

  const t = (key: string): string => {
    if (language === 'en') return translations['en'][key] || key;
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  // Proactively translate common items when language changes
  useEffect(() => {
    if (language === 'en') return;

    const categories = ["RRB", "SSC", "UPSC", "BPSC", "POLICE", "ARMY", "NAVI", "AGNEEVEER", "SSB", "NEET", "JEE"];
    const states = [
      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
      "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
      "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
      "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
      "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
      "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
      "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
    ];

    const toTranslate = [...categories, ...states];
    
    // Filter out already translated items
    const missing = toTranslate.filter(text => !translations[language]?.[text]);

    if (missing.length > 0) {
      const translateBatch = async (items: string[]) => {
        const batchSize = 15;
        const results: Record<string, string> = {};
        
        for (let i = 0; i < items.length; i += batchSize) {
          const batch = items.slice(i, i + batchSize);
          const prompt = `Translate the following terms to ${language}. Return a JSON object where keys are the original terms and values are the translations.
          Terms: ${JSON.stringify(batch)}`;

          try {
            const response = await ai.models.generateContent({
              model: "gemini-3-flash-preview",
              contents: prompt,
              config: { responseMimeType: "application/json" }
            });
            
            const result = JSON.parse(response.text);
            Object.assign(results, result);
          } catch (error) {
            console.error("Proactive batch translation error:", error);
          }
        }
        return results;
      };

      translateBatch(missing).then(results => {
        if (Object.keys(results).length > 0) {
          setTranslations(prev => {
            const next = { ...prev };
            if (!next[language]) next[language] = {};
            next[language] = { ...next[language], ...results };
            localStorage.setItem('cachedTranslations', JSON.stringify(next));
            return next;
          });
        }
      });
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateDynamic }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
