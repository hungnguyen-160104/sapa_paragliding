<template>
  <main 
    class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat px-4 py-6 sm:px-6 lg:px-8"
    style="background-image: url('/images/nen3.jpg')"
  >
    <div class="absolute inset-0 bg-black/10"></div>

    <section class="relative z-10 w-full max-w-[840px] rounded-[32px] border border-white/40 bg-white/20 px-6 py-10 text-center shadow-[0_12px_40px_rgba(0,0,0,0.15)] backdrop-blur-md sm:px-12 sm:py-14">
      
      <h1 class="text-[22px] font-medium uppercase leading-tight text-[#1e3a5f] sm:text-[30px] md:text-[34px]">
        {{ content.title1 }} <br/>
        {{ content.title2 }}<strong class="font-extrabold text-[#0f2c59]">SAPA PARAGLIDING</strong>{{ content.title3 }}
      </h1>

      <p class="mt-4 text-[15px] text-[#1e3a5f] sm:text-[18px]">
        {{ content.subtitle1 }} <strong class="font-bold">{{ content.subtitle2 }}</strong>.
      </p>

      <div class="mt-8 mb-10 flex justify-center">
        <NuxtLink
          to="/booking"
          class="group flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6] px-10 py-4 text-[15px] font-bold uppercase tracking-wide text-white shadow-[0_8px_24px_rgba(29,78,216,0.3)] transition-all hover:scale-105 hover:shadow-[0_12px_32px_rgba(29,78,216,0.4)]"
        >
          {{ content.primaryCta }}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transition-transform group-hover:-translate-y-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2C6.48 2 2 6.48 2 12h20c0-5.52-4.48-10-10-10z"></path>
            <path d="M12 12v8"></path>
            <path d="M6 12l5 8"></path>
            <path d="M18 12l-5 8"></path>
            <circle cx="12" cy="21" r="1.5" fill="currentColor"></circle>
          </svg>
        </NuxtLink>
      </div>

      <div class="mx-auto max-w-[640px] rounded-[24px] border border-white/30 bg-white/30 px-6 py-7 backdrop-blur-sm">
        <p class="mb-5 text-[16px] text-[#1e3a5f] sm:text-[18px]">
          {{ content.infoText }}
        </p>
        <NuxtLink
          to="/"
          class="inline-flex min-w-[130px] items-center justify-center rounded-full border border-[#0f2c59] px-8 py-2.5 text-[14px] font-bold uppercase text-[#0f2c59] transition-colors hover:bg-[#0f2c59] hover:text-white"
        >
          {{ content.secondaryCta }}
        </NuxtLink>
      </div>
    </section>

    <footer class="relative z-10 mt-10 text-center">
      <p class="mb-5 text-[14px] text-white drop-shadow-md sm:text-[15px]">
        {{ content.supportText }}
      </p>
      <div class="flex flex-wrap items-center justify-center gap-4">
        <a 
          href="https://zalo.me/84386887489" 
          target="_blank" 
          class="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/25"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21.05 15.65c0 .64-.47 1.15-1.05 1.15h-1.63c-.15 1.17-.67 2.21-1.45 3.03l2.4 1.34c.32.18.42.59.2.89-.14.19-.36.29-.58.29-.12 0-.25-.03-.36-.09l-3.23-1.81c-1.02.44-2.15.69-3.35.69-4.42 0-8-3.13-8-7s3.58-7 8-7 8 3.13 8 7zm-11.83-1.88h2.09c.28 0 .5-.22.5-.5s-.22-.5-.5-.5H9.22c-.28 0-.5.22-.5.5s.22.5.5.5zm4.81-2.61h-6.9c-.28 0-.5.22-.5.5s.22.5.5.5h6.9c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm0-2.61h-6.9c-.28 0-.5.22-.5.5s.22.5.5.5h6.9c.28 0 .5-.22.5-.5s-.22-.5-.5-.5z"/></svg>
          ZALO
        </a>
        
        <a 
          href="https://wa.me/84522794999"
          target="_blank" 
          class="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/25"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.571-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          WHATSAPP
        </a>

        <a 
          href="https://www.facebook.com/bayduluonsapa/" 
          target="_blank" 
          class="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/25"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          FACEBOOK
        </a>
      </div>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";

type LocaleKey = "vi" | "en" | "fr" | "ru" | "zh" | "hi";

const { locale } = useI18n();

const supportedLocales: LocaleKey[] = ["vi", "en", "fr", "ru", "zh", "hi"];

const currentLocale = computed<LocaleKey>(() => {
  const value = locale.value as LocaleKey;
  return supportedLocales.includes(value) ? value : "vi";
});

// Prevent QR landing page from being indexed
useHead({
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

const pageContent: Record<
  LocaleKey,
  {
    title1: string;
    title2: string;
    title3: string;
    subtitle1: string;
    subtitle2: string;
    primaryCta: string;
    infoText: string;
    secondaryCta: string;
    supportText: string;
  }
> = {
  vi: {
    title1: "Cảm ơn bạn đã lựa chọn đặt bay",
    title2: "Cùng ",
    title3: "",
    subtitle1: "Chúng tôi có lịch bay hằng ngày và",
    subtitle2: "đón trả khách từ khách sạn",
    primaryCta: "Tiếp tục đặt chỗ",
    infoText: "Xem thông tin về điểm bay, các gói bay và dịch vụ...",
    secondaryCta: "Tại đây",
    supportText: "Hoặc chat với đội ngũ nhân viên của chúng tôi để được hỗ trợ trực tiếp (24/7)"
  },
  en: {
    title1: "Thank you for choosing to fly",
    title2: "With ",
    title3: "",
    subtitle1: "We have daily flight schedules and",
    subtitle2: "hotel pickup & drop-off",
    primaryCta: "Continue booking",
    infoText: "View information about flying sites, packages and services...",
    secondaryCta: "Here",
    supportText: "Or chat with our team for direct support (24/7)"
  },
  fr: {
    title1: "Merci d'avoir choisi de voler",
    title2: "Avec ",
    title3: "",
    subtitle1: "Nous avons des vols quotidiens et",
    subtitle2: "prise en charge à l'hôtel",
    primaryCta: "Continuer la réservation",
    infoText: "Voir les informations sur les sites de vol, les forfaits et services...",
    secondaryCta: "Ici",
    supportText: "Ou discutez avec notre équipe pour un support direct (24/7)"
  },
  ru: {
    title1: "Спасибо, что выбрали полет",
    title2: "Вместе с ",
    title3: "",
    subtitle1: "У нас ежедневные расписания и",
    subtitle2: "трансфер из отеля",
    primaryCta: "Продолжить бронирование",
    infoText: "Посмотреть информацию о летных местах, пакетах и услугах...",
    secondaryCta: "Здесь",
    supportText: "Или напишите нашей команде для прямой поддержки (24/7)"
  },
  zh: {
    title1: "感谢您选择飞行",
    title2: "与 ",
    title3: " 一起",
    subtitle1: "我们有每日航班时刻表和",
    subtitle2: "酒店接送服务",
    primaryCta: "继续预订",
    infoText: "查看飞行地点、套餐和服务信息...",
    secondaryCta: "点击这里",
    supportText: "或与我们的团队聊天以获得直接支持 (24/7)"
  },
  hi: {
    title1: "उड़ान चुनने के लिए धन्यवाद",
    title2: "",
    title3: " के साथ",
    subtitle1: "हमारे पास दैनिक उड़ान कार्यक्रम हैं और",
    subtitle2: "होटल पिकअप और ड्रॉप-ऑफ",
    primaryCta: "बुकिंग जारी रखें",
    infoText: "उड़ान स्थलों, पैकेजों और सेवाओं के बारे में जानकारी देखें...",
    secondaryCta: "यहाँ",
    supportText: "या प्रत्यक्ष सहायता के लिए हमारी टीम से चैट करें (24/7)"
  },
};

const content = computed(() => pageContent[currentLocale.value]);
</script>