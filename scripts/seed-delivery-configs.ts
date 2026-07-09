// seed-delivery-configs.ts
// Seeds LGA-level delivery configs for every Nigerian state from DELIVERY COST BREAKDOWN.csv.
//
// Logic per LGA:
//   - City exists in state  → delete its existing delivery_configs, insert new ones
//   - City does not exist   → create the city, then insert delivery_configs
//
// Lagos LGAs get a single "direct" config.
// Every other state gets "park" + "gig" configs.
//
// Run: npx ts-node --esm scripts/seed-delivery-configs.ts

import { createClient } from "@supabase/supabase-js";
import { resolve } from "path";

async function loadEnv() {
  const { config } = await import("dotenv");
  const root = resolve(process.cwd());
  config({ path: resolve(root, ".env.local") });
  config({ path: resolve(root, ".env") });
}

// ── Data from DELIVERY COST BREAKDOWN.csv ──────────────────────────────────────

type StateEntry = {
  state: string;  // name to search in DB (case-insensitive)
  lgas: string[];
  park: number;
  gig: number;
};

type LagosEntry = { lga: string; direct: number };

const OUTSIDE_LAGOS: StateEntry[] = [
  // ── SOUTH EAST ──────────────────────────────────────────────────────────────
  {
    state: "Abia",
    park: 7000, gig: 10500,
    lgas: ["Aba North", "Aba South", "Arochukwu", "Bende", "Ikwuano", "Isiala Ngwa North", "Isiala Ngwa South", "Isuikwuato", "Obi Ngwa", "Ohafia", "Osisioma", "Ugwunagbo", "Ukwa East", "Ukwa West", "Umuahia North", "Umuahia South", "Umu Nneochi"],
  },
  {
    state: "Anambra",
    park: 8000, gig: 12000,
    lgas: ["Aguata", "Anambra East", "Anambra West", "Anaocha", "Awka North", "Awka South", "Ayamelum", "Dunukofia", "Ekwusigo", "Idemili North", "Idemili South", "Ihiala", "Njikoka", "Nnewi North", "Nnewi South", "Ogbaru", "Onitsha North", "Onitsha South", "Orumba North", "Orumba South", "Oyi"],
  },
  {
    state: "Ebonyi",
    park: 7000, gig: 10500,
    lgas: ["Abakaliki", "Afikpo North", "Afikpo South", "Ebonyi", "Ezza North", "Ezza South", "Ikwo", "Ishielu", "Ivo", "Izzi", "Ohaozara", "Ohaukwu", "Onicha"],
  },
  {
    state: "Enugu",
    park: 7000, gig: 10500,
    lgas: ["Aninri", "Awgu", "Enugu East", "Enugu North", "Enugu South", "Ezeagu", "Igbo Etiti", "Igbo Eze North", "Igbo Eze South", "Isi Uzo", "Nkanu East", "Nkanu West", "Nsukka", "Oji River", "Udenu", "Udi", "Uzo Uwani"],
  },
  {
    state: "Imo",
    park: 7000, gig: 10500,
    lgas: ["Aboh Mbaise", "Ahiazu Mbaise", "Ehime Mbano", "Ezinihitte", "Ideato North", "Ideato South", "Ihitte/Uboma", "Ikeduru", "Isiala Mbano", "Isu", "Mbaitoli", "Ngor Okpala", "Njaba", "Nkwerre", "Nwangele", "Obowo", "Oguta", "Ohaji/Egbema", "Okigwe", "Orlu", "Orsu", "Oru East", "Oru West", "Owerri Municipal", "Owerri North", "Owerri West", "Unuimo"],
  },
  // ── SOUTH WEST ──────────────────────────────────────────────────────────────
  {
    state: "Ekiti",
    park: 6000, gig: 9000,
    lgas: ["Ado Ekiti", "Efon", "Ekiti East", "Ekiti South-West", "Ekiti West", "Emure", "Gbonyin", "Ido Osi", "Ijero", "Ikere", "Ikole", "Ilejemeje", "Irepodun/Ifelodun", "Ise/Orun", "Moba", "Oye"],
  },
  {
    state: "Ogun",
    park: 6000, gig: 9000,
    lgas: ["Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Egbado North", "Egbado South", "Ewekoro", "Ifo", "Ijebu East", "Ijebu North", "Ijebu North East", "Ijebu Ode", "Ikenne", "Imeko Afon", "Ipokia", "Obafemi Owode", "Odeda", "Odogbolu", "Ogun Waterside", "Remo North", "Shagamu"],
  },
  {
    state: "Ondo",
    park: 6000, gig: 9000,
    lgas: ["Akoko North-East", "Akoko North-West", "Akoko South-East", "Akoko South-West", "Akure North", "Akure South", "Ese Odo", "Idanre", "Ifedore", "Ilaje", "Ile Oluji/Okeigbo", "Irele", "Odigbo", "Okitipupa", "Ondo East", "Ondo West", "Ose", "Owo"],
  },
  {
    state: "Osun",
    park: 6000, gig: 9000,
    lgas: ["Atakumosa East", "Atakumosa West", "Ayedaade", "Ayedire", "Boluwaduro", "Boripe", "Ede North", "Ede South", "Egbedore", "Ejigbo", "Ife Central", "Ife East", "Ife North", "Ife South", "Ifedayo", "Ifelodun", "Ila", "Ilesa East", "Ilesa West", "Irepodun", "Irewole", "Isokan", "Iwo", "Obokun", "Odo-Otin", "Ola-Oluwa", "Olorunda", "Oriade", "Orolu", "Osogbo"],
  },
  {
    state: "Oyo",
    park: 6000, gig: 9000,
    lgas: ["Afijio", "Akinyele", "Atiba", "Atisbo", "Egbeda", "Ibadan North", "Ibadan North-East", "Ibadan North-West", "Ibadan South-East", "Ibadan South-West", "Ibarapa Central", "Ibarapa East", "Ibarapa North", "Ido", "Irepo", "Iseyin", "Itesiwaju", "Iwajowa", "Kajola", "Lagelu", "Ogbomosho North", "Ogbomosho South", "Ogo Oluwa", "Olorunsogo", "Oluyole", "Ona Ara", "Orelope", "Ori Ire", "Oyo East", "Oyo West", "Saki East", "Saki West", "Surulere"],
  },
  // ── SOUTH SOUTH ─────────────────────────────────────────────────────────────
  {
    state: "Akwa Ibom",
    park: 7000, gig: 10500,
    lgas: ["Abak", "Eastern Obolo", "Eket", "Esit Eket", "Essien Udim", "Etim Ekpo", "Etinan", "Ibeno", "Ibesikpo Asutan", "Ibiono-Ibom", "Ika", "Ikono", "Ikot Abasi", "Ikot Ekpene", "Ini", "Itu", "Mbo", "Mkpat-Enin", "Nsit-Atai", "Nsit-Ibom", "Nsit-Ubium", "Obot Akara", "Okobo", "Onna", "Oron", "Oruk Anam", "Udung-Uko", "Ukanafun", "Uruan", "Urue-Offong/Oruko", "Uyo"],
  },
  {
    state: "Bayelsa",
    park: 7000, gig: 10500,
    lgas: ["Brass", "Ekeremor", "Kolokuma/Opokuma", "Nembe", "Ogbia", "Sagbama", "Southern Ijaw", "Yenagoa"],
  },
  {
    state: "Cross River",
    park: 7000, gig: 10500,
    lgas: ["Abi", "Akamkpa", "Akpabuyo", "Bakassi", "Bekwarra", "Biase", "Boki", "Calabar Municipal", "Calabar South", "Etung", "Ikom", "Obanliku", "Obubra", "Obudu", "Odukpani", "Ogoja", "Yakuur", "Yala"],
  },
  {
    state: "Delta",
    park: 7000, gig: 10500,
    lgas: ["Aniocha North", "Aniocha South", "Bomadi", "Burutu", "Ethiope East", "Ethiope West", "Ika North East", "Ika South", "Isoko North", "Isoko South", "Ndokwa East", "Ndokwa West", "Okpe", "Oshimili North", "Oshimili South", "Patani", "Sapele", "Udu", "Ughelli North", "Ughelli South", "Ukwuani", "Uvwie", "Warri North", "Warri South", "Warri South West"],
  },
  {
    state: "Edo",
    park: 7000, gig: 10500,
    lgas: ["Akoko-Edo", "Egor", "Esan Central", "Esan North-East", "Esan South-East", "Esan West", "Etsako Central", "Etsako East", "Etsako West", "Igueben", "Ikpoba-Okha", "Orhionmwon", "Oredo", "Ovia North-East", "Ovia South-West", "Owan East", "Owan West", "Uhunmwonde"],
  },
  {
    state: "Rivers",
    park: 7000, gig: 10500,
    lgas: ["Abua/Odual", "Ahoada East", "Ahoada West", "Akuku-Toru", "Andoni", "Asari-Toru", "Bonny", "Degema", "Eleme", "Emuoha", "Etche", "Gokana", "Ikwerre", "Khana", "Obio/Akpor", "Ogba/Egbema/Ndoni", "Ogu/Bolo", "Okrika", "Omuma", "Opobo/Nkoro", "Oyigbo", "Port Harcourt", "Tai"],
  },
  // ── NORTH WEST ──────────────────────────────────────────────────────────────
  {
    state: "Jigawa",
    park: 8000, gig: 12000,
    lgas: ["Auyo", "Babura", "Biriniwa", "Birnin Kudu", "Buji", "Dutse", "Gagarawa", "Garki", "Gumel", "Guri", "Gwaram", "Gwiwa", "Hadejia", "Jahun", "Kafin Hausa", "Kazaure", "Kiri Kasamma", "Kiyawa", "Maigatari", "Malam Madori", "Miga", "Ringim", "Roni", "Sule Tankarkar", "Taura", "Yankwashi"],
  },
  {
    state: "Kaduna",
    park: 8000, gig: 12000,
    lgas: ["Birnin Gwari", "Chikun", "Giwa", "Igabi", "Ikara", "Jaba", "Jema'a", "Kachia", "Kaduna North", "Kaduna South", "Kagarko", "Kajuru", "Kaura", "Kauru", "Kubau", "Kudan", "Lere", "Makarfi", "Sabon Gari", "Sanga", "Soba", "Zangon Kataf", "Zaria"],
  },
  {
    state: "Kano",
    park: 8000, gig: 12000,
    lgas: ["Ajingi", "Albasu", "Bagwai", "Bebeji", "Bichi", "Bunkure", "Dala", "Dambatta", "Dawakin Kudu", "Dawakin Tofa", "Doguwa", "Fagge", "Gabasawa", "Garko", "Garun Mallam", "Gaya", "Gezawa", "Gwale", "Gwarzo", "Kabo", "Kano Municipal", "Karaye", "Kibiya", "Kiru", "Kumbotso", "Kunchi", "Kura", "Madobi", "Makoda", "Minjibir", "Nasarawa", "Rano", "Rimin Gado", "Rogo", "Shanono", "Sumaila", "Takai", "Tarauni", "Tofa", "Tsanyawa", "Tudun Wada", "Ungogo", "Warawa", "Wudil"],
  },
  {
    state: "Katsina",
    park: 8000, gig: 12000,
    lgas: ["Bakori", "Batagarawa", "Batsari", "Baure", "Bindawa", "Charanchi", "Dandume", "Danja", "Dan Musa", "Daura", "Dutsi", "Dutsin-Ma", "Faskari", "Funtua", "Ingawa", "Jibia", "Kafur", "Kaita", "Kankara", "Kankia", "Katsina", "Kurfi", "Kusada", "Mai'adua", "Malumfashi", "Mani", "Mashi", "Matazu", "Musawa", "Rimi", "Sabuwa", "Safana", "Sandamu", "Zango"],
  },
  {
    state: "Kebbi",
    park: 8000, gig: 12000,
    lgas: ["Aleiro", "Arewa Dandi", "Argungu", "Augie", "Bagudo", "Birnin Kebbi", "Bunza", "Dandi", "Fakai", "Gwandu", "Isa", "Jega", "Kalgo", "Koko/Besse", "Maiyama", "Ngaski", "Sakaba", "Shanga", "Suru", "Wasagu/Danko", "Yauri", "Zuru"],
  },
  {
    state: "Sokoto",
    park: 8000, gig: 12000,
    lgas: ["Binji", "Bodinga", "Dange Shuni", "Gada", "Goronyo", "Gudu", "Gwadabawa", "Illela", "Isa", "Kebbe", "Kware", "Rabah", "Sabon Birni", "Shagari", "Silame", "Sokoto North", "Sokoto South", "Tambuwal", "Tangaza", "Tureta", "Wamako", "Wurno", "Yabo"],
  },
  {
    state: "Zamfara",
    park: 8000, gig: 12000,
    lgas: ["Anka", "Bakura", "Birnin Magaji/Kiyaw", "Bukkuyum", "Bungudu", "Gummi", "Gusau", "Kaura Namoda", "Maradun", "Maru", "Shinkafi", "Talata Mafara", "Tsafe", "Zurmi"],
  },
  // ── NORTH EAST ──────────────────────────────────────────────────────────────
  {
    state: "Adamawa",
    park: 8000, gig: 12000,
    lgas: ["Demsa", "Fufure", "Ganye", "Girei", "Gombi", "Guyuk", "Hong", "Jada", "Lamurde", "Madagali", "Maiha", "Mayo-Belwa", "Michika", "Mubi North", "Mubi South", "Numan", "Shelleng", "Song", "Toungo", "Yola North", "Yola South"],
  },
  {
    state: "Bauchi",
    park: 8000, gig: 12000,
    lgas: ["Alkaleri", "Bauchi", "Bogoro", "Damban", "Darazo", "Dass", "Gamawa", "Ganjuwa", "Giade", "Itas/Gadau", "Jama'are", "Katagum", "Kirfi", "Misau", "Ningi", "Shira", "Tafawa Balewa", "Toro", "Warji", "Zaki"],
  },
  {
    state: "Borno",
    park: 8000, gig: 12000,
    lgas: ["Abadam", "Askira/Uba", "Bama", "Bayo", "Biu", "Chibok", "Damboa", "Dikwa", "Gubio", "Guzamala", "Gwoza", "Hawul", "Jere", "Kaga", "Kala/Balge", "Konduga", "Kukawa", "Kwaya Kusar", "Mafa", "Magumeri", "Maiduguri", "Marte", "Mobbar", "Monguno", "Ngala", "Nganzai", "Shani"],
  },
  {
    state: "Gombe",
    park: 8000, gig: 12000,
    lgas: ["Akko", "Balanga", "Billiri", "Dukku", "Funakaye", "Gombe", "Kaltungo", "Kwami", "Nafada", "Shomgom", "Yamaltu/Deba"],
  },
  {
    state: "Taraba",
    park: 8000, gig: 12000,
    lgas: ["Ardo Kola", "Bali", "Donga", "Gashaka", "Gassol", "Ibi", "Jalingo", "Karim Lamido", "Kurmi", "Lau", "Sardauna", "Takum", "Ussa", "Wukari", "Yorro", "Zing"],
  },
  {
    state: "Yobe",
    park: 8000, gig: 12000,
    lgas: ["Bade", "Bursari", "Damaturu", "Fika", "Fune", "Geidam", "Gujba", "Gulani", "Jakusko", "Karasuwa", "Machina", "Nangere", "Nguru", "Potiskum", "Tarmuwa", "Yunusari", "Yusufari"],
  },
  // ── NORTH CENTRAL ───────────────────────────────────────────────────────────
  {
    state: "Benue",
    park: 8000, gig: 12000,
    lgas: ["Ado", "Agatu", "Apa", "Buruku", "Gboko", "Guma", "Gwer East", "Gwer West", "Katsina-Ala", "Konshisha", "Kwande", "Logo", "Makurdi", "Obi", "Ogbadibo", "Ohimini", "Oju", "Okpokwu", "Otukpo", "Tarka", "Ukum", "Ushongo", "Vandeikya"],
  },
  {
    state: "Kogi",
    park: 8000, gig: 12000,
    lgas: ["Adavi", "Ajaokuta", "Ankpa", "Bassa", "Dekina", "Ibaji", "Idah", "Igalamela-Odolu", "Ijumu", "Kabba/Bunu", "Kogi", "Lokoja", "Mopa-Muro", "Ofu", "Ogori/Magongo", "Okehi", "Okene", "Olamaboro", "Omala", "Yagba East", "Yagba West"],
  },
  {
    state: "Kwara",
    park: 8000, gig: 12000,
    lgas: ["Asa", "Baruten", "Edu", "Ekiti", "Ifelodun", "Ilorin East", "Ilorin South", "Ilorin West", "Irepodun", "Isin", "Kaiama", "Moro", "Offa", "Oke Ero", "Oyun", "Pategi"],
  },
  {
    state: "Nasarawa",
    park: 8000, gig: 12000,
    lgas: ["Akwanga", "Awe", "Doma", "Karu", "Keana", "Keffi", "Kokona", "Lafia", "Nasarawa", "Nasarawa Egon", "Obi", "Toto", "Wamba"],
  },
  {
    state: "Niger",
    park: 8000, gig: 12000,
    lgas: ["Agaie", "Agwara", "Bida", "Borgu", "Bosso", "Chanchaga", "Edati", "Gbako", "Gurara", "Katcha", "Kontagora", "Lapai", "Lavun", "Magama", "Mariga", "Mashegu", "Mokwa", "Munya", "Paikoro", "Rafi", "Rijau", "Shiroro", "Suleja", "Tafa", "Wushishi"],
  },
  {
    state: "Plateau",
    park: 8000, gig: 12000,
    lgas: ["Barkin Ladi", "Bassa", "Bokkos", "Jos East", "Jos North", "Jos South", "Kanam", "Kanke", "Langtang North", "Langtang South", "Mangu", "Mikang", "Pankshin", "Qua'an Pan", "Riyom", "Shendam", "Wase"],
  },
  {
    // DB may store this as "Abuja", "FCT", or "Federal Capital Territory"
    state: "Abuja",
    park: 8000, gig: 12000,
    lgas: ["Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal Area Council"],
  },
];

const LAGOS_LGAS: LagosEntry[] = [
  { lga: "Agege",             direct: 4000 },
  { lga: "Ajeromi-Ifelodun",  direct: 5000 },
  { lga: "Alimosho",          direct: 4000 },
  { lga: "Amuwo-Odofin",      direct: 5000 },
  { lga: "Apapa",             direct: 4000 },
  { lga: "Badagry",           direct: 6000 },
  { lga: "Epe",               direct: 6000 },
  { lga: "Eti-Osa",           direct: 5000 },
  { lga: "Ibeju-Lekki",       direct: 6000 },
  { lga: "Ifako-Ijaiye",      direct: 4000 },
  { lga: "Ikeja",             direct: 4000 },
  { lga: "Ikorodu",           direct: 6000 },
  { lga: "Kosofe",            direct: 4000 },
  { lga: "Lagos Island",      direct: 5000 },
  { lga: "Lagos Mainland",    direct: 4000 },
  { lga: "Mushin",            direct: 4000 },
  { lga: "Ojo",               direct: 5000 },
  { lga: "Oshodi-Isolo",      direct: 4000 },
  { lga: "Shomolu",           direct: 4000 },
  { lga: "Surulere",          direct: 4000 },
];

// ── Delivery time estimates ────────────────────────────────────────────────────

const ESTIMATED_DAYS: Record<string, string> = {
  park:   "3-10 business days",
  gig:    "7-14 business days",
  direct: "1-3 business days",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

async function findState(
  supabase: SupabaseClient,
  stateName: string,
  countryId: string,
): Promise<{ id: string; name: string } | null> {
  // Try exact case-insensitive match first
  const { data } = await supabase
    .from("states")
    .select("id, name")
    .ilike("name", stateName)
    .eq("country_id", countryId)
    .limit(1)
    .maybeSingle();

  if (data) return data;

  // Fallback: partial match (useful for "Abuja" matching "Federal Capital Territory, Abuja")
  const { data: partial } = await supabase
    .from("states")
    .select("id, name")
    .ilike("name", `%${stateName}%`)
    .eq("country_id", countryId)
    .limit(1)
    .maybeSingle();

  return partial ?? null;
}

async function upsertCity(
  supabase: SupabaseClient,
  lgaName: string,
  stateId: string,
): Promise<string> {
  // Check if city exists
  const { data: existing } = await supabase
    .from("cities")
    .select("id")
    .ilike("name", lgaName)
    .eq("state_id", stateId)
    .limit(1)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("delivery_configs")
      .delete()
      .eq("city_id", existing.id);
    return existing.id;
  }

  // Create the city
  const { data: created, error } = await supabase
    .from("cities")
    .insert({ name: lgaName, state_id: stateId })
    .select("id")
    .single();

  if (error || !created) throw new Error(`Failed to create city "${lgaName}": ${error?.message}`);
  return created.id;
}

async function insertConfigs(
  supabase: SupabaseClient,
  cityId: string,
  configs: { method: string; price: number }[],
) {
  const { error } = await supabase
    .from("delivery_configs")
    .insert(configs.map((c) => ({ city_id: cityId, method: c.method, price: c.price, estimated_days: ESTIMATED_DAYS[c.method] ?? null })));

  if (error) throw new Error(`Failed to insert configs for city ${cityId}: ${error.message}`);
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  await loadEnv();

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Get Nigeria's country ID
  const { data: nigeria, error: countryErr } = await supabase
    .from("countries")
    .select("id")
    .ilike("name", "Nigeria")
    .limit(1)
    .maybeSingle();

  if (countryErr || !nigeria) {
    console.error("❌ Could not find Nigeria in countries table");
    process.exit(1);
  }

  const nigeriaId: string = nigeria.id;
  console.log(`🇳🇬 Nigeria ID: ${nigeriaId}\n`);

  let totalCreated = 0;
  let totalUpdated = 0;
  let stateErrors = 0;

  // ── Outside Lagos ────────────────────────────────────────────────────────────

  for (const entry of OUTSIDE_LAGOS) {
    const stateRow = await findState(supabase, entry.state, nigeriaId);

    if (!stateRow) {
      console.warn(`⚠️  State not found: "${entry.state}" — skipping ${entry.lgas.length} LGAs`);
      stateErrors++;
      continue;
    }

    console.log(`📍 ${stateRow.name} (park: ₦${entry.park.toLocaleString()}, gig: ₦${entry.gig.toLocaleString()})`);

    for (const lga of entry.lgas) {
      try {
        // Check if city already existed before upsertCity deletes its configs
        const { data: existing } = await supabase
          .from("cities")
          .select("id")
          .ilike("name", lga)
          .eq("state_id", stateRow.id)
          .limit(1)
          .maybeSingle();

        const wasExisting = !!existing;
        const cityId = await upsertCity(supabase, lga, stateRow.id);

        await insertConfigs(supabase, cityId, [
          { method: "park", price: entry.park },
          { method: "gig",  price: entry.gig  },
        ]);

        if (wasExisting) {
          console.log(`   ✏️  Updated: ${lga}`);
          totalUpdated++;
        } else {
          console.log(`   ✅ Created: ${lga}`);
          totalCreated++;
        }
      } catch (err) {
        console.error(`   ❌ Failed: ${lga} — ${(err as Error).message}`);
      }
    }

    console.log();
  }

  // ── Lagos ────────────────────────────────────────────────────────────────────

  const lagosRow = await findState(supabase, "Lagos", nigeriaId);

  if (!lagosRow) {
    console.error("❌ Lagos not found in states table");
  } else {
    console.log(`📍 ${lagosRow.name} (direct delivery per LGA)`);

    for (const entry of LAGOS_LGAS) {
      try {
        const { data: existing } = await supabase
          .from("cities")
          .select("id")
          .ilike("name", entry.lga)
          .eq("state_id", lagosRow.id)
          .limit(1)
          .maybeSingle();

        const wasExisting = !!existing;
        const cityId = await upsertCity(supabase, entry.lga, lagosRow.id);

        await insertConfigs(supabase, cityId, [
          { method: "direct", price: entry.direct },
        ]);

        if (wasExisting) {
          console.log(`   ✏️  Updated: ${entry.lga} — ₦${entry.direct.toLocaleString()}`);
          totalUpdated++;
        } else {
          console.log(`   ✅ Created: ${entry.lga} — ₦${entry.direct.toLocaleString()}`);
          totalCreated++;
        }
      } catch (err) {
        console.error(`   ❌ Failed: ${entry.lga} — ${(err as Error).message}`);
      }
    }
  }

  console.log(`\n📊 Done — ${totalCreated} created, ${totalUpdated} updated, ${stateErrors} states not found`);
}

main().catch(console.error);
