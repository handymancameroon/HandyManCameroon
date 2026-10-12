/**
 * Handy Man Buea — Core Application Logic
 * Version: 1.7.3 (Restored share button – bottom right fixed + language bottom left fixed)
 * Date: 12 October 2026
 *
 * SECURITY NOTES:
 * - Supabase credentials are loaded from config.js
 * - Never expose service role key
 * - Admin checks are client-side only for UI
 */

const CONFIG = (typeof window !== 'undefined' && window.HANDYMAN_CONFIG) ? window.HANDYMAN_CONFIG : {};
const SUPABASE_URL = CONFIG.SUPABASE_URL || '';
const SUPABASE_KEY = CONFIG.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('[HandyMan] CRITICAL: Missing Supabase configuration.');
}

var supabaseClient = null;
var currentUser = null;
var currentProfile = null;
var notificationPollingInterval = null;
var carouselInterval = null;

const FALLBACK_CATEGORIES = [
    {name: 'Plumbing', icon: '🔧', description: 'Leak repairs, installations, toilets, water heaters'},
    {name: 'Electrical', icon: '⚡', description: 'Wiring, sockets, lighting, electrical repairs'},
    {name: 'Carpentry', icon: '🪚', description: 'Woodwork, furniture, fittings'},
    {name: 'Cleaning', icon: '🧹', description: 'Domestic, office, deep cleaning'},
    {name: 'Painting', icon: '🎨', description: 'Interior and exterior painting'},
    {name: 'Masonry', icon: '🧱', description: 'Bricklaying, concrete work, construction'},
    {name: 'Auto Mechanics', icon: '🚗', description: 'Car and motorcycle repairs'},
    {name: 'Phone/Laptop Repair', icon: '💻', description: 'Device repairs and troubleshooting'},
    {name: 'Hairdressing', icon: '💇', description: 'Hair styling, barbing, braiding'},
    {name: 'Catering', icon: '🍲', description: 'Event cooking and food services'},
    {name: 'Nanny', icon: '👶', description: 'Childcare and nanny services'},
    {name: 'House help', icon: '🏠', description: 'Domestic house help and cleaning support'},
    {name: 'General Labour', icon: '💪', description: 'General labour and odd jobs'},
    {name: 'Laundry services', icon: '👕', description: 'Washing, ironing and laundry'},
    {name: 'Transporter', icon: '🚚', description: 'Goods and people transport'},
    {name: 'Errands', icon: '🏃', description: 'Running errands and deliveries'},
    {name: 'Construction Engineer', icon: '🏗️', description: 'Construction planning and engineering'},
    {name: 'Teacher/Tutors', icon: '📚', description: 'Teaching and private tutoring'},
    {name: 'Lawyer', icon: '⚖️', description: 'Legal advice and representation'},
    {name: 'Family Doctors', icon: '🩺', description: 'General medical consultation'},
    {name: 'Stay at Home Nurse', icon: '💉', description: 'Home nursing and patient care'},
    {name: 'Security Guard', icon: '🛡️', description: 'Security and guarding services'},
    {name: 'Gardener', icon: '🌿', description: 'Gardening and outdoor maintenance'},
    {name: 'Others', icon: '✨', description: 'Other services not listed above'}
];

// ============================================================================
// FULL TRANSLATIONS (EN + FR) — COMPLETE
// ============================================================================
const I18N = {
    en: {
        nav_home: "Home",
        nav_workers: "Find Workers",
        nav_jobs: "Find Jobs",
        nav_join: "Join as Worker",
        nav_post: "Post a Job",
        nav_login: "Login",
        nav_logout: "Logout",
        nav_profile: "My Profile",

        search: "Search",
        loading: "Loading...",
        view_profile: "View Profile",
        reviews: "reviews",
        no_workers: "No workers found. Try a different search.",
        workers_title: "Find Workers in Cameroon",
        search_placeholder: "Search by name, skill or town...",
        all_categories: "All Categories",
        all_towns: "All Towns",
        error: "An error occurred. Please try again.",
        select_town: "Select town",
        select_skill: "Select your main skill / category",
        other: "Other (specify below)",
        other_simple: "Other",

        hero_title: "Find Trusted Local Help in Cameroon",
        hero_sub: "Connect with skilled plumbers, electricians, cleaners, and more — anywhere in Cameroon.",
        hero_find: "Find a Worker",
        hero_post: "Post a Job",
        slide2_title: "Skilled Construction Workers",
        slide2_sub: "Find masons, carpenters, and builders for your projects in Buea, Douala, Yaoundé and beyond.",
        slide2_btn: "Find Builders",
        slide3_title: "Professional Cleaning Services",
        slide3_sub: "Get your home or office sparkling clean with verified local cleaners.",
        slide3_btn: "Find Cleaners",
        slide4_title: "Expert Electrical Repairs",
        slide4_sub: "Safe and reliable electrical work for your property anywhere in Cameroon.",
        slide4_btn: "Find Electricians",
        popular_services: "Popular Services",
        services_intro: "Browse plumbing, electrical, carpentry, cleaning, painting, masonry, auto mechanics, phone repair, hairdressing, catering, nanny, house help, laundry, transporter, teachers, lawyers, nurses, security guards, gardeners and more across Cameroon.",
        featured_workers: "Featured Workers in Cameroon",
        how_title: "How It Works",
        how_search: "Search",
        how_search_p: "Find the right worker in your town",
        how_contact: "Contact",
        how_contact_p: "Call or WhatsApp them directly",
        how_done: "Get It Done",
        how_done_p: "Rate and review after service",
        cities_title: "Cities we serve in Cameroon",
        cities_text: "Handy Man helps you find local skilled workers in Buea, Limbe, Douala, Yaoundé, Bamenda, Bafoussam, Kribi, Kumba, Garoua, Maroua, Ngaoundéré, Bertoua, Ebolowa, Dschang, Nkongsamba, Edéa, Mutengene, Tiko and other towns across Cameroon. Looking for a plumber, electrician, carpenter or cleaner near you? Start on our Find Workers page or post a job for free.",
        footer_tagline: "Handy Man Cameroon — Find trusted local help: plumbers, electricians, cleaners, carpenters and more.",
        footer_copy: "© 2026 Handy Man. Connecting people with skilled workers across Cameroon. | Available in English and French.",

        jobs_title: "Find Jobs in Cameroon",
        jobs_placeholder: "Search for a job or town...",
        no_jobs: "No jobs found.",

        join_title: "Join as a Service Provider",
        join_sub: "Create your worker profile to receive jobs anywhere in Cameroon.",
        town_label: "Town where you work *",
        category_label: "Service Category *",
        description_label: "Description of Services *",
        experience_label: "Years of Experience",
        phone_label: "Phone for Calls",
        whatsapp_label: "WhatsApp Number",
        create_profile: "Create Profile",
        desc_placeholder: "Describe what you do, your skills, and experience...",

        login_title: "Login / Register",
        login_tab: "Login",
        register_tab: "Register",
        email_label: "Email",
        password_label: "Password",
        confirm_password_label: "Confirm Password *",
        password_mismatch: "Passwords do not match. Please type the same password twice.",
        fullname_label: "Full Name",
        phone_reg_label: "Phone Number",
        login_btn: "Login",
        register_btn: "Create Account",
        already_account: "Already have an account? Login",
        no_account: "Don't have an account? Register",
        client_type: "I need a worker (Client)",
        worker_type: "I want to offer services (Worker)",

        post_title: "Post a Job",
        post_sub: "Describe what you need and workers will contact you.",
        job_title_label: "Job Title *",
        job_category_label: "Category needed *",
        job_description_label: "Job Description *",
        job_location_label: "Location (Town + Quarter) *",
        job_budget_label: "Budget (or Negotiable)",
        post_job_btn: "Post Job",
        job_title_placeholder: "e.g. Fix leaking toilet",
        job_desc_placeholder: "Describe the problem in detail...",
        job_location_placeholder: "e.g. Molyko, Buea",
        job_budget_placeholder: "e.g. 5000 FCFA or Negotiable",

        my_dashboard: "My Profile",
        my_photo: "My profile photo",
        my_jobs: "My posted jobs",
        open_jobs_category: "Open jobs in my category",
        my_worker_profile: "My worker profile",
        my_disputes: "My disputes / reports",
        upload_change_photo: "Upload / Change photo",
        select_photo_first: "Please select a photo first",
        upload_failed: "Upload failed. Please try again.",
        photo_updated: "Photo updated successfully!",
        no_jobs_yet: "You have not posted any jobs yet.",
        post_first_job: "Post your first job",
        close_job: "Close job",
        no_worker_profile: "You do not have a worker profile yet.",
        create_worker_profile: "Create worker profile",
        view_job: "View job",
        contact_us: "Contact Us",
        send_message: "Send Message",
        edit_profile: "Edit My Profile",
        save_profile: "Save Profile Changes",
        profile_saved: "Profile saved successfully!",

        leave_rating_worker: "Leave a Rating for this Worker",
        leave_rating_client: "Rate this Client",
        your_rating: "Your Rating",
        your_review_comment: "Your Review / Comment (optional)",
        your_comment: "Your Comment (optional)",
        submit_rating: "Submit Rating & Comment",
        no_reviews_yet: "No reviews yet. Be the first to rate this worker!",
        no_client_ratings: "No ratings for this client yet.",
        login_to_rate: "Please login or register to leave a rating and comment.",
        login_to_rate_client: "Please login to rate this client.",
        registered_only_reviews: "Only registered users can leave reviews. Your photo and name will appear with your review.",
        no_comment: "No comment",
        rating_5: "5 Stars - Excellent",
        rating_4: "4 Stars - Very Good",
        rating_3: "3 Stars - Good",
        rating_2: "2 Stars - Fair",
        rating_1: "1 Star - Poor",
        rating_submitted: "Thank you! Your rating has been submitted.",
        rating_error: "Could not submit rating. Please try again.",
        tell_experience: "Tell others about your experience with this worker...",
        how_was_client: "How was working with this client?",

        about: "About",
        contact: "Contact",
        experience: "Experience",
        availability: "Availability",
        years: "years",
        no_description: "No description yet.",
        verified: "Verified",
        new_badge: "New",
        report_worker: "Report this worker",
        portfolio: "Portfolio",
        photo: "photo",
        photos: "photos",
        reviews_title: "Reviews",
        call_now: "Call Now",
        whatsapp: "WhatsApp",
        loading_profile: "Loading profile...",
        worker_not_found: "Worker not found.",
        cannot_connect: "Cannot connect to database.",
        profile_unavailable: "This worker profile is no longer available.",
        error_loading_profile: "Error loading profile. Please try again.",

        job_description: "Job Description",
        client_information: "Client Information",
        ratings_for_client: "Ratings for this Client",
        report_job: "Report this job",
        reference_photos: "Reference Photos",
        contact_the_client: "Contact the client:",
        no_phone_provided: "No phone number provided.",
        this_job_is_closed: "This job is closed.",
        status_open: "OPEN — Workers Can Apply",
        status_closed: "CLOSED — No Longer Accepting Applications",
        your_job_notice: "This is your job. Close it from your Dashboard when done.",
        job_closed_notice: "This job is closed. Post a new job if you need more help.",
        loading_job: "Loading job...",
        job_not_found: "Job not found.",
        error_loading_job: "Error loading job. Please try again.",
        posted: "Posted",
        budget: "Budget",
        not_specified: "Not specified",
        anonymous: "Anonymous",

        cat_Plumbing: "Plumbing",
        cat_Electrical: "Electrical",
        cat_Carpentry: "Carpentry",
        cat_Cleaning: "Cleaning",
        cat_Painting: "Painting",
        cat_Masonry: "Masonry",
        cat_Auto_Mechanics: "Auto Mechanics",
        cat_Phone_Laptop_Repair: "Phone/Laptop Repair",
        cat_Hairdressing: "Hairdressing",
        cat_Catering: "Catering",
        cat_Nanny: "Nanny",
        cat_House_help: "House help",
        cat_General_Labour: "General Labour",
        cat_Laundry_services: "Laundry services",
        cat_Transporter: "Transporter",
        cat_Errands: "Errands",
        cat_Construction_Engineer: "Construction Engineer",
        cat_Teacher_Tutors: "Teacher/Tutors",
        cat_Lawyer: "Lawyer",
        cat_Family_Doctors: "Family Doctors",
        cat_Stay_at_Home_Nurse: "Stay at Home Nurse",
        cat_Security_Guard: "Security Guard",
        cat_Gardener: "Gardener",
        cat_Others: "Others"
    },
    fr: {
        nav_home: "Accueil",
        nav_workers: "Trouver des ouvriers",
        nav_jobs: "Trouver des emplois",
        nav_join: "Devenir ouvrier",
        nav_post: "Publier un emploi",
        nav_login: "Connexion",
        nav_logout: "Déconnexion",
        nav_profile: "Mon profil",

        search: "Rechercher",
        loading: "Chargement...",
        view_profile: "Voir le profil",
        reviews: "avis",
        no_workers: "Aucun ouvrier trouvé. Essayez une autre recherche.",
        workers_title: "Trouver des ouvriers au Cameroun",
        search_placeholder: "Rechercher par nom, compétence ou ville...",
        all_categories: "Toutes les catégories",
        all_towns: "Toutes les villes",
        error: "Une erreur s'est produite. Veuillez réessayer.",
        select_town: "Sélectionner une ville",
        select_skill: "Sélectionnez votre compétence principale / catégorie",
        other: "Autre (précisez ci-dessous)",
        other_simple: "Autre",

        hero_title: "Trouvez une aide locale de confiance au Cameroun",
        hero_sub: "Connectez-vous avec des plombiers, électriciens, agents d'entretien et plus encore — partout au Cameroun.",
        hero_find: "Trouver un ouvrier",
        hero_post: "Publier un emploi",
        slide2_title: "Ouvriers du bâtiment qualifiés",
        slide2_sub: "Trouvez des maçons, menuisiers et constructeurs pour vos projets à Buea, Douala, Yaoundé et au-delà.",
        slide2_btn: "Trouver des constructeurs",
        slide3_title: "Services de nettoyage professionnels",
        slide3_sub: "Faites briller votre maison ou bureau avec des agents d'entretien locaux vérifiés.",
        slide3_btn: "Trouver des agents d'entretien",
        slide4_title: "Réparations électriques expertes",
        slide4_sub: "Travaux électriques sûrs et fiables pour votre propriété partout au Cameroun.",
        slide4_btn: "Trouver des électriciens",
        popular_services: "Services populaires",
        services_intro: "Parcourez plomberie, électricité, menuiserie, nettoyage, peinture, maçonnerie, mécanique auto, réparation de téléphones, coiffure, restauration, nounou, aide ménagère, blanchisserie, transporteur, enseignants, avocats, infirmiers, agents de sécurité, jardiniers et plus encore partout au Cameroun.",
        featured_workers: "Ouvriers en vedette au Cameroun",
        how_title: "Comment ça marche",
        how_search: "Rechercher",
        how_search_p: "Trouvez le bon ouvrier dans votre ville",
        how_contact: "Contacter",
        how_contact_p: "Appelez ou écrivez sur WhatsApp directement",
        how_done: "Faites réaliser vos travaux",
        how_done_p: "Notez et commentez après le service",
        cities_title: "Villes desservies au Cameroun",
        cities_text: "Handy Man vous aide à trouver des ouvriers qualifiés locaux à Buea, Limbé, Douala, Yaoundé, Bamenda, Bafoussam, Kribi, Kumba, Garoua, Maroua, Ngaoundéré, Bertoua, Ebolowa, Dschang, Nkongsamba, Edéa, Mutengene, Tiko et dans d'autres villes du Cameroun. Vous cherchez un plombier, un électricien, un menuisier ou un agent d'entretien près de chez vous ? Commencez sur la page Trouver des ouvriers ou publiez un emploi gratuitement.",
        footer_tagline: "Handy Man Cameroun — Trouvez une aide locale de confiance : plombiers, électriciens, agents d'entretien, menuisiers et plus encore.",
        footer_copy: "© 2026 Handy Man. Relier les gens aux ouvriers qualifiés partout au Cameroun. | Disponible en anglais et en français.",

        jobs_title: "Trouver des emplois au Cameroun",
        jobs_placeholder: "Rechercher un emploi ou une ville...",
        no_jobs: "Aucun emploi trouvé.",

        join_title: "Devenir prestataire de services",
        join_sub: "Créez votre profil d'ouvrier pour recevoir des emplois partout au Cameroun.",
        town_label: "Ville où vous travaillez *",
        category_label: "Catégorie de service *",
        description_label: "Description des services *",
        experience_label: "Années d'expérience",
        phone_label: "Téléphone pour les appels",
        whatsapp_label: "Numéro WhatsApp",
        create_profile: "Créer le profil",
        desc_placeholder: "Décrivez ce que vous faites, vos compétences et votre expérience...",

        login_title: "Connexion / Inscription",
        login_tab: "Connexion",
        register_tab: "Inscription",
        email_label: "Email",
        password_label: "Mot de passe",
        confirm_password_label: "Confirmer le mot de passe *",
        password_mismatch: "Les mots de passe ne correspondent pas. Veuillez saisir le même mot de passe deux fois.",
        fullname_label: "Nom complet",
        phone_reg_label: "Numéro de téléphone",
        login_btn: "Se connecter",
        register_btn: "Créer un compte",
        already_account: "Vous avez déjà un compte ? Connexion",
        no_account: "Pas encore de compte ? Inscription",
        client_type: "J'ai besoin d'un ouvrier (Client)",
        worker_type: "Je veux offrir des services (Ouvrier)",

        post_title: "Publier un emploi",
        post_sub: "Décrivez ce dont vous avez besoin et les ouvriers vous contacteront.",
        job_title_label: "Titre de l'emploi *",
        job_category_label: "Catégorie nécessaire *",
        job_description_label: "Description de l'emploi *",
        job_location_label: "Lieu (Ville + Quartier) *",
        job_budget_label: "Budget (ou Négociable)",
        post_job_btn: "Publier l'emploi",
        job_title_placeholder: "ex. Réparer une toilette qui fuit",
        job_desc_placeholder: "Décrivez le problème en détail...",
        job_location_placeholder: "ex. Molyko, Buea",
        job_budget_placeholder: "ex. 5000 FCFA ou Négociable",

        my_dashboard: "Mon profil",
        my_photo: "Ma photo de profil",
        my_jobs: "Mes emplois publiés",
        open_jobs_category: "Emplois ouverts dans ma catégorie",
        my_worker_profile: "Mon profil d'ouvrier",
        my_disputes: "Mes litiges / signalements",
        upload_change_photo: "Télécharger / Changer la photo",
        select_photo_first: "Veuillez d'abord sélectionner une photo",
        upload_failed: "Échec du téléchargement. Veuillez réessayer.",
        photo_updated: "Photo mise à jour avec succès !",
        no_jobs_yet: "Vous n'avez pas encore publié d'emploi.",
        post_first_job: "Publier votre premier emploi",
        close_job: "Fermer l'emploi",
        no_worker_profile: "Vous n'avez pas encore de profil d'ouvrier.",
        create_worker_profile: "Créer un profil d'ouvrier",
        view_job: "Voir l'emploi",
        contact_us: "Contactez-nous",
        send_message: "Envoyer le message",
        edit_profile: "Modifier mon profil",
        save_profile: "Enregistrer les modifications",
        profile_saved: "Profil enregistré avec succès !",

        leave_rating_worker: "Laisser une note pour cet ouvrier",
        leave_rating_client: "Noter ce client",
        your_rating: "Votre note",
        your_review_comment: "Votre avis / commentaire (optionnel)",
        your_comment: "Votre commentaire (optionnel)",
        submit_rating: "Soumettre la note et le commentaire",
        no_reviews_yet: "Pas encore d'avis. Soyez le premier à noter cet ouvrier !",
        no_client_ratings: "Pas encore de notes pour ce client.",
        login_to_rate: "Veuillez vous connecter ou vous inscrire pour laisser une note et un commentaire.",
        login_to_rate_client: "Veuillez vous connecter pour noter ce client.",
        registered_only_reviews: "Seuls les utilisateurs inscrits peuvent laisser des avis. Votre photo et votre nom apparaîtront avec votre avis.",
        no_comment: "Aucun commentaire",
        rating_5: "5 Étoiles - Excellent",
        rating_4: "4 Étoiles - Très bien",
        rating_3: "3 Étoiles - Bien",
        rating_2: "2 Étoiles - Moyen",
        rating_1: "1 Étoile - Médiocre",
        rating_submitted: "Merci ! Votre note a été soumise.",
        rating_error: "Impossible de soumettre la note. Veuillez réessayer.",
        tell_experience: "Parlez de votre expérience avec cet ouvrier...",
        how_was_client: "Comment s'est passé le travail avec ce client ?",

        about: "À propos",
        contact: "Contact",
        experience: "Expérience",
        availability: "Disponibilité",
        years: "ans",
        no_description: "Pas encore de description.",
        verified: "Vérifié",
        new_badge: "Nouveau",
        report_worker: "Signaler cet ouvrier",
        portfolio: "Portfolio",
        photo: "photo",
        photos: "photos",
        reviews_title: "Avis",
        call_now: "Appeler maintenant",
        whatsapp: "WhatsApp",
        loading_profile: "Chargement du profil...",
        worker_not_found: "Ouvrier introuvable.",
        cannot_connect: "Impossible de se connecter à la base de données.",
        profile_unavailable: "Ce profil d'ouvrier n'est plus disponible.",
        error_loading_profile: "Erreur lors du chargement du profil. Veuillez réessayer.",

        job_description: "Description de l'emploi",
        client_information: "Informations sur le client",
        ratings_for_client: "Notes pour ce client",
        report_job: "Signaler cet emploi",
        reference_photos: "Photos de référence",
        contact_the_client: "Contacter le client :",
        no_phone_provided: "Aucun numéro de téléphone fourni.",
        this_job_is_closed: "Cet emploi est fermé.",
        status_open: "OUVERT — Les ouvriers peuvent postuler",
        status_closed: "FERMÉ — N'accepte plus de candidatures",
        your_job_notice: "C'est votre emploi. Fermez-le depuis votre tableau de bord une fois terminé.",
        job_closed_notice: "Cet emploi est fermé. Publiez un nouvel emploi si vous avez encore besoin d'aide.",
        loading_job: "Chargement de l'emploi...",
        job_not_found: "Emploi introuvable.",
        error_loading_job: "Erreur lors du chargement de l'emploi. Veuillez réessayer.",
        posted: "Publié",
        budget: "Budget",
        not_specified: "Non précisé",
        anonymous: "Anonyme",

        cat_Plumbing: "Plomberie",
        cat_Electrical: "Électricité",
        cat_Carpentry: "Menuiserie",
        cat_Cleaning: "Nettoyage",
        cat_Painting: "Peinture",
        cat_Masonry: "Maçonnerie",
        cat_Auto_Mechanics: "Mécanique auto",
        cat_Phone_Laptop_Repair: "Réparation téléphone/ordinateur",
        cat_Hairdressing: "Coiffure",
        cat_Catering: "Restauration",
        cat_Nanny: "Nounou",
        cat_House_help: "Aide ménagère",
        cat_General_Labour: "Main-d'œuvre générale",
        cat_Laundry_services: "Services de blanchisserie",
        cat_Transporter: "Transporteur",
        cat_Errands: "Courses",
        cat_Construction_Engineer: "Ingénieur en construction",
        cat_Teacher_Tutors: "Enseignant/Tuteurs",
        cat_Lawyer: "Avocat",
        cat_Family_Doctors: "Médecins de famille",
        cat_Stay_at_Home_Nurse: "Infirmier(ère) à domicile",
        cat_Security_Guard: "Agent de sécurité",
        cat_Gardener: "Jardinier",
        cat_Others: "Autres"
    }
};

function t(key) {
    var lang = localStorage.getItem('handyman_lang') || 'en';
    return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
}

function getCategoryDisplayName(englishName) {
    if (!englishName) return '';
    var key = 'cat_' + englishName.replace(/[\s\/]+/g, '_');
    return t(key) || englishName;
}

function setLanguage(lang) {
    if (lang !== 'en' && lang !== 'fr') lang = 'en';
    localStorage.setItem('handyman_lang', lang);
    applyLanguage();
}

function applyLanguage() {
    var lang = localStorage.getItem('handyman_lang') || 'en';
    document.documentElement.lang = lang;

    var enBtn = document.getElementById('langEn');
    var frBtn = document.getElementById('langFr');
    if (enBtn) enBtn.classList.toggle('active', lang === 'en');
    if (frBtn) frBtn.classList.toggle('active', lang === 'fr');

    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var key = el.getAttribute('data-i18n');
        if (!key) return;
        var text = t(key);
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = text;
        } else {
            el.textContent = text;
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
        var key = el.getAttribute('data-i18n-placeholder');
        if (key) el.placeholder = t(key);
    });

    var nav = document.getElementById('nav');
    if (nav) {
        var links = nav.querySelectorAll('a');
        links.forEach(function(a) {
            var href = (a.getAttribute('href') || '').toLowerCase();
            if (href.includes('index.html') || href === '/' || href === '') {
                if (!a.classList.contains('logo') && !a.hasAttribute('data-i18n')) a.textContent = t('nav_home');
            } else if (href.includes('workers.html') && !a.hasAttribute('data-i18n')) {
                a.textContent = t('nav_workers');
            } else if (href.includes('jobs.html') && !a.hasAttribute('data-i18n')) {
                a.textContent = t('nav_jobs');
            } else if ((href.includes('join.html') || (href.includes('login.html') && a.id !== 'authBtn')) && !a.hasAttribute('data-i18n')) {
                a.textContent = t('nav_join');
            } else if (href.includes('post-job.html') && !a.hasAttribute('data-i18n')) {
                a.textContent = t('nav_post');
            }
        });
    }

    var dash = document.getElementById('navDashboard');
    if (dash) dash.textContent = t('nav_profile');

    var authBtn = document.getElementById('authBtn');
    if (authBtn) {
        if (currentUser) {
            authBtn.textContent = t('nav_logout');
        } else {
            authBtn.textContent = t('nav_login');
        }
    }

    var title = document.querySelector('.search-page h1');
    if (title && !title.hasAttribute('data-i18n')) title.textContent = t('workers_title');

    var searchInput = document.getElementById('searchQuery');
    if (searchInput) searchInput.placeholder = t('search_placeholder');

    var searchBtn = document.querySelector('.search-filters .btn-primary');
    if (searchBtn) searchBtn.textContent = t('search');

    translateAllSelects();

    if (document.getElementById('categoryGrid')) {
        renderCategories(FALLBACK_CATEGORIES);
    }
}

function translateAllSelects() {
    var categorySelectIds = [
        'categoryFilter',
        'jCategory',
        'wCategory',
        'serviceCategory'
    ];

    categorySelectIds.forEach(function(id) {
        var sel = document.getElementById(id);
        if (!sel) return;

        Array.from(sel.options).forEach(function(opt) {
            var val = (opt.value || '').trim();

            if (!val) {
                if (id === 'categoryFilter') {
                    opt.text = t('all_categories');
                } else {
                    opt.text = t('select_skill');
                }
            } else if (val === 'Others' || val.toLowerCase() === 'others') {
                opt.text = t('cat_Others');
            } else {
                opt.text = getCategoryDisplayName(val);
            }
        });
    });

    var townSelectIds = [
        'townFilter',
        'jTown',
        'wTown',
        'regTown'
    ];

    townSelectIds.forEach(function(id) {
        var sel = document.getElementById(id);
        if (!sel) return;

        Array.from(sel.options).forEach(function(opt) {
            var val = (opt.value || '').trim();

            if (!val) {
                if (id === 'townFilter') {
                    opt.text = t('all_towns');
                } else {
                    opt.text = t('select_town');
                }
            } else if (val === 'Other' || val.toLowerCase() === 'other') {
                opt.text = (opt.textContent.toLowerCase().indexOf('specify') !== -1 || opt.textContent.toLowerCase().indexOf('précisez') !== -1) ? t('other') : t('other_simple');
            }
        });
    });
}

// ============================================================================
// MOBILE MENU
// ============================================================================
function initMobileMenu() {
    var menuToggle = document.getElementById('menuToggle');
    var nav = document.getElementById('nav');
    if (!menuToggle || !nav) return;

    if (menuToggle.getAttribute('data-menu-ready') === '1') return;
    menuToggle.setAttribute('data-menu-ready', '1');

    menuToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        nav.classList.toggle('active');
        var expanded = nav.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });

    // Close when tapping outside the menu
    document.addEventListener('click', function (e) {
        if (!nav.classList.contains('active')) return;
        if (nav.contains(e.target) || menuToggle.contains(e.target)) return;
        nav.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    });
}

// ============================================================================
// APP INIT
// ============================================================================
document.addEventListener('DOMContentLoaded', async function() {
    // FIX: bind mobile menu FIRST (before any await) so it works on all pages on phones
    initMobileMenu();

    try {
        injectNavExtras();
        injectShareButton();
        injectLanguageSwitcher();
        trackVisitor();
        await checkAuth();
        applyLanguage();

        if (document.getElementById('categoryGrid')) {
            await loadCategories();
        }
        if (document.getElementById('workerGrid')) {
            await loadFeaturedWorkers();
        }
        if (document.getElementById('carouselDots')) {
            initCarousel();
        }

        // Original menu binding kept; skipped if initMobileMenu already bound the button
        var menuToggle = document.getElementById('menuToggle');
        if (menuToggle && menuToggle.getAttribute('data-menu-ready') !== '1') {
            menuToggle.addEventListener('click', function() {
                var n = document.getElementById('nav');
                if (n) n.classList.toggle('active');
            });
        }
    } catch (err) {
        console.error('[HandyMan] App init error:', err);
        // Ensure menu still works even if other init fails
        initMobileMenu();
        if (document.getElementById('categoryGrid')) {
            renderCategories(FALLBACK_CATEGORIES);
        }
    }
});

// ============================================================================
// LANGUAGE SWITCHER (bottom-left, always visible)
// ============================================================================
function injectLanguageSwitcher() {
    if (document.getElementById('langSwitch')) return;

    var switcher = document.createElement('div');
    switcher.id = 'langSwitch';
    switcher.className = 'lang-switch';
    switcher.innerHTML = `
        <button type="button" id="langEn" onclick="setLanguage('en')">EN</button>
        <button type="button" id="langFr" onclick="setLanguage('fr')">FR</button>
    `;
    document.body.appendChild(switcher);

    var style = document.createElement('style');
    style.textContent = `
        .lang-switch {
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 999;
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 30px;
            padding: 6px 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.12);
            font-size: 0.85rem;
        }
        .lang-switch button {
            background: none;
            border: none;
            cursor: pointer;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 20px;
            color: #64748b;
        }
        .lang-switch button.active {
            background: #2563eb;
            color: #fff;
        }
    `;
    document.head.appendChild(style);
}

// ============================================================================
// SHARE BUTTON (blue chain icon, bottom-right, always visible)
// ============================================================================
function injectShareButton() {
    if (document.getElementById('shareFab')) return;

    var fab = document.createElement('div');
    fab.id = 'shareFab';
    fab.className = 'share-fab';
    fab.innerHTML = '🔗';
    fab.title = 'Share Handy Man';
    fab.setAttribute('aria-label', 'Share Handy Man');
    fab.onclick = openShareModal;
    document.body.appendChild(fab);

    var modal = document.createElement('div');
    modal.id = 'shareModal';
    modal.className = 'share-modal';
    modal.innerHTML = `
        <div class="share-modal-content">
            <div class="share-modal-header">
                <h3>🔗 Share Handy Man</h3>
                <button class="share-close" onclick="closeShareModal()" aria-label="Close">✕</button>
            </div>
            <div class="share-message-box">
                <p id="shareText">🔧 Find trusted local workers in Cameroon! https://handyman-buea.vercel.app/</p>
                <button class="btn-small" onclick="copyShareText()" style="margin-top:12px;">📋 Copy Message</button>
            </div>
            <div class="share-buttons">
                <a href="#" id="shareWhatsApp" target="_blank" rel="noopener" class="btn-whatsapp share-btn">📱 WhatsApp</a>
                <a href="#" id="shareFacebook" target="_blank" rel="noopener" class="btn-primary share-btn" style="background:#1877f2;">📘 Facebook</a>
                <a href="#" id="shareTwitter" target="_blank" rel="noopener" class="btn-primary share-btn" style="background:#1da1f2;">🐦 Twitter</a>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeShareModal();
    });
}

function openShareModal() {
    var modal = document.getElementById('shareModal');
    if (!modal) return;

    var shareUrl = 'https://handyman-buea.vercel.app/';
    var shareMessage = '🔧 Find trusted local workers in Cameroon! ' + shareUrl;
    var text = encodeURIComponent(shareMessage);
    var url = encodeURIComponent(shareUrl);

    var shareTextEl = document.getElementById('shareText');
    if (shareTextEl) shareTextEl.textContent = shareMessage;

    var wa = document.getElementById('shareWhatsApp');
    var fb = document.getElementById('shareFacebook');
    var tw = document.getElementById('shareTwitter');

    if (wa) wa.href = 'https://wa.me/?text=' + text;
    if (fb) fb.href = 'https://www.facebook.com/sharer/sharer.php?u=' + url;
    if (tw) tw.href = 'https://twitter.com/intent/tweet?text=' + text;

    modal.classList.add('active');
}

function closeShareModal() {
    var modal = document.getElementById('shareModal');
    if (modal) modal.classList.remove('active');
}

function copyShareText() {
    var el = document.getElementById('shareText');
    var text = el ? el.textContent : '🔧 Find trusted local workers in Cameroon! https://handyman-buea.vercel.app/';
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
            alert('Message copied!');
        }).catch(function() {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        alert('Message copied!');
    } catch (e) {
        alert('Could not copy. Please copy manually.');
    }
    document.body.removeChild(ta);
}

// ============================================================================
// FILE UPLOAD
// ============================================================================
async function uploadFile(file, folder, userId) {
    if (!supabaseClient || !file) return null;
    try {
        const uid = userId || (currentUser && currentUser.id) || 'anonymous';
        const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
        const safeExt = fileExt || 'jpg';
        const fileName = Date.now() + '_' + Math.random().toString(36).substring(2, 11) + '.' + safeExt;
        const filePath = folder + '/' + uid + '/' + fileName;

        const { error: uploadError } = await supabaseClient.storage
            .from('handyman-files')
            .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
            console.error('[HandyMan] Upload error:', uploadError);
            return null;
        }

        const { data } = supabaseClient.storage.from('handyman-files').getPublicUrl(filePath);
        return data && data.publicUrl ? data.publicUrl : null;
    } catch (err) {
        console.error('[HandyMan] uploadFile exception:', err);
        return null;
    }
}

// ============================================================================
// ANALYTICS
// ============================================================================
async function trackVisitor() {
    if (!supabaseClient || sessionStorage.getItem('visitorTracked')) return;
    try {
        var today = new Date().toISOString().slice(0, 10);
        var { data: stats } = await supabaseClient
            .from('site_stats')
            .select('total_visitors, visitors_today, visitors_today_date')
            .eq('id', 1)
            .single();

        if (!stats) return;

        var total = (stats.total_visitors || 0) + 1;
        var todayCount = stats.visitors_today || 0;
        if (stats.visitors_today_date !== today) {
            todayCount = 1;
        } else {
            todayCount += 1;
        }

        await supabaseClient
            .from('site_stats')
            .update({
                total_visitors: total,
                visitors_today: todayCount,
                visitors_today_date: today
            })
            .eq('id', 1);

        sessionStorage.setItem('visitorTracked', '1');
    } catch (err) {
        console.warn('[HandyMan] trackVisitor failed:', err);
    }
}

// ============================================================================
// AUTH
// ============================================================================
async function checkAuth() {
    if (!window.supabase || !SUPABASE_URL || !SUPABASE_KEY) {
        console.error('[HandyMan] Supabase client library or config missing');
        return;
    }
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user) {
            currentUser = session.user;
            await loadCurrentProfile();
        }
    } catch (err) {
        console.error('[HandyMan] Auth check error:', err);
    }

    updateAuthUI();
}

async function loadCurrentProfile() {
    if (!currentUser || !supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        if (!error && data) {
            currentProfile = data;
        }
    } catch (err) {
        console.error('[HandyMan] loadCurrentProfile error:', err);
    }
}

function updateAuthUI() {
    var authBtn = document.getElementById('authBtn');
    if (!authBtn) return;

    if (currentUser) {
        authBtn.textContent = t('nav_logout');
        authBtn.href = '#';
        authBtn.onclick = function(e) {
            e.preventDefault();
            logout();
        };
    } else {
        authBtn.textContent = t('nav_login');
        authBtn.href = 'login.html';
        authBtn.onclick = null;
    }
}

async function logout() {
    if (!supabaseClient) return;
    try {
        await supabaseClient.auth.signOut();
        currentUser = null;
        currentProfile = null;
        window.location.href = 'index.html';
    } catch (err) {
        console.error('[HandyMan] Logout error:', err);
    }
}

// ============================================================================
// NAV EXTRAS (notifications bell)
// ============================================================================
function injectNavExtras() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    // Dashboard link for logged-in users
    if (currentUser && !document.getElementById('navDashboard')) {
        var dashLink = document.createElement('a');
        dashLink.href = 'dashboard.html';
        dashLink.id = 'navDashboard';
        dashLink.textContent = t('nav_profile');
        var authBtn = document.getElementById('authBtn');
        if (authBtn) {
            nav.insertBefore(dashLink, authBtn);
        } else {
            nav.appendChild(dashLink);
        }
    }

    // Notification bell
    if (document.getElementById('navBell')) return;

    var bellContainer = document.createElement('div');
    bellContainer.id = 'navBell';
    bellContainer.className = 'nav-bell';
    bellContainer.innerHTML = '🔔<span class="bell-count" id="bellCount" style="display:none;">0</span>';
    bellContainer.style.cursor = 'pointer';
    bellContainer.style.position = 'relative';
    bellContainer.style.fontSize = '1.2rem';
    bellContainer.style.padding = '8px';
    bellContainer.onclick = function(e) {
        e.stopPropagation();
        toggleNotifications();
    };

    var authBtn = document.getElementById('authBtn');
    if (authBtn) nav.insertBefore(bellContainer, authBtn);
    else nav.appendChild(bellContainer);

    var dropdown = document.createElement('div');
    dropdown.className = 'notification-dropdown';
    dropdown.id = 'notificationDropdown';
    dropdown.innerHTML = '<div class="notification-header">🔔 Notifications</div><div class="notification-list" id="notificationList"><p class="notification-empty">Loading...</p></div>';
    document.body.appendChild(dropdown);

    document.addEventListener('click', function(e) {
        var d = document.getElementById('notificationDropdown');
        var b = document.getElementById('navBell');
        if (d && b && !d.contains(e.target) && !b.contains(e.target)) {
            d.classList.remove('active');
        }
    });
}

function toggleNotifications() {
    var dropdown = document.getElementById('notificationDropdown');
    if (!dropdown) return;
    dropdown.classList.toggle('active');
    if (dropdown.classList.contains('active')) {
        loadNotifications();
    }
}

async function loadNotifications() {
    var list = document.getElementById('notificationList');
    if (!list) return;

    if (!currentUser || !supabaseClient) {
        list.innerHTML = '<p class="notification-empty">Please login to see notifications.</p>';
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('notifications')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        if (!data || data.length === 0) {
            list.innerHTML = '<p class="notification-empty">No notifications yet.</p>';
            updateBellCount(0);
            return;
        }

        var unread = data.filter(function(n) { return !n.read; }).length;
        updateBellCount(unread);

        list.innerHTML = data.map(function(n) {
            return '<div class="notification-item' + (n.read ? '' : ' unread') + '" data-id="' + n.id + '">' +
                '<strong>' + escapeHtml(n.title || 'Notification') + '</strong>' +
                '<p>' + escapeHtml(n.message || '') + '</p>' +
                '<small>' + new Date(n.created_at).toLocaleString() + '</small>' +
                '</div>';
        }).join('');

        // Mark as read on open
        data.forEach(function(n) {
            if (!n.read) {
                supabaseClient.from('notifications').update({ read: true }).eq('id', n.id);
            }
        });
        updateBellCount(0);
    } catch (err) {
        console.error('[HandyMan] loadNotifications error:', err);
        list.innerHTML = '<p class="notification-empty">Could not load notifications.</p>';
    }
}

function updateBellCount(count) {
    var el = document.getElementById('bellCount');
    if (!el) return;
    if (count > 0) {
        el.textContent = count > 9 ? '9+' : count;
        el.style.display = 'inline-block';
    } else {
        el.style.display = 'none';
    }
}

// ============================================================================
// CATEGORIES & WORKERS
// ============================================================================
async function loadCategories() {
    if (!supabaseClient) {
        renderCategories(FALLBACK_CATEGORIES);
        return;
    }
    try {
        const { data, error } = await supabaseClient
            .from('categories')
            .select('*')
            .order('name');
        if (error || !data || data.length === 0) {
            renderCategories(FALLBACK_CATEGORIES);
        } else {
            renderCategories(data);
        }
    } catch (err) {
        renderCategories(FALLBACK_CATEGORIES);
    }
}

function renderCategories(cats) {
    var grid = document.getElementById('categoryGrid');
    if (!grid) return;
    grid.innerHTML = cats.map(function(c) {
        var name = c.name || c;
        var icon = c.icon || '✨';
        var desc = c.description || '';
        return '<div class="category-card" onclick="location.href=\'workers.html?category=' + encodeURIComponent(name) + '\'">' +
            '<div class="category-icon">' + icon + '</div>' +
            '<h3>' + escapeHtml(getCategoryDisplayName(name)) + '</h3>' +
            '<p>' + escapeHtml(desc) + '</p>' +
            '</div>';
    }).join('');
}

async function loadFeaturedWorkers() {
    var grid = document.getElementById('workerGrid');
    if (!grid || !supabaseClient) {
        if (grid) grid.innerHTML = '<p class="loading">' + t('loading') + '</p>';
        return;
    }
    try {
        const { data, error } = await supabaseClient
            .from('worker_details')
            .select(`
                *,
                profiles:id (
                    full_name,
                    location,
                    avatar_url,
                    is_worker
                )
            `)
            .eq('availability', 'Available')
            .order('sort_order', { ascending: true, nullsFirst: false })
            .order('rating', { ascending: false })
            .limit(12);

        if (error) throw error;

        if (!data || data.length === 0) {
            grid.innerHTML = '<p class="loading">' + t('no_workers') + '</p>';
            return;
        }

        grid.innerHTML = data.map(function(w) {
            var profile = w.profiles || {};
            var name = profile.full_name || 'Worker';
            var loc = profile.location || w.location || '';
            var avatar = profile.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=2563eb&color=fff';
            var rating = w.rating ? Number(w.rating).toFixed(1) : '—';
            var reviews = w.review_count || 0;
            var verifiedBadge = w.verified ? '<span class="badge" style="background:#22c55e;">✓ ' + t('verified') + '</span>' : '';

            return '<div class="worker-card" onclick="location.href=\'worker.html?id=' + w.id + '\'">' +
                '<div class="worker-avatar"><img src="' + escapeHtml(avatar) + '" alt="' + escapeHtml(name) + '" loading="lazy"></div>' +
                '<h3>' + escapeHtml(name) + '</h3>' +
                verifiedBadge +
                '<div class="worker-category">' + escapeHtml(getCategoryDisplayName(w.category)) + '</div>' +
                '<div class="worker-location">' + escapeHtml(loc) + '</div>' +
                '<div class="worker-rating">⭐ ' + rating + ' (' + reviews + ' ' + t('reviews') + ')</div>' +
                '<a href="worker.html?id=' + w.id + '" class="btn-small">' + t('view_profile') + '</a>' +
                '</div>';
        }).join('');
    } catch (err) {
        console.error('[HandyMan] loadFeaturedWorkers error:', err);
        grid.innerHTML = '<p class="loading">' + t('error') + '</p>';
    }
}

// ============================================================================
// CAROUSEL
// ============================================================================
function initCarousel() {
    var slides = document.querySelectorAll('.carousel-slide');
    var dotsContainer = document.getElementById('carouselDots');
    if (!slides.length || !dotsContainer) return;

    dotsContainer.innerHTML = '';
    slides.forEach(function(_, i) {
        var dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Slide ' + (i + 1));
        dot.onclick = function() { goToSlide(i); };
        dotsContainer.appendChild(dot);
    });

    var current = 0;
    function goToSlide(index) {
        slides[current].classList.remove('active');
        dotsContainer.children[current].classList.remove('active');
        current = index;
        slides[current].classList.add('active');
        dotsContainer.children[current].classList.add('active');
    }

    if (carouselInterval) clearInterval(carouselInterval);
    carouselInterval = setInterval(function() {
        goToSlide((current + 1) % slides.length);
    }, 5000);
}

// ============================================================================
// HELPERS
// ============================================================================
function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

window.escapeHtml = escapeHtml;
window.setLanguage = setLanguage;
window.openShareModal = openShareModal;
window.closeShareModal = closeShareModal;
window.copyShareText = copyShareText;
window.t = t;
