import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CoffeeIcon from "@mui/icons-material/Coffee";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import MovieIcon from "@mui/icons-material/Movie";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import mohonaImage from "../../../assets/images/mohona.jpeg";

const moodOptions = [
  { id: "cozy", title: "Calm mood", text: "Shanto place, slow dinner, ar kono hurry nai." },
  { id: "hungry", title: "Khidey lagse", text: "Age bhalo food. Simple and clear." },
  { id: "fancy", title: "Elegant mood", text: "Bhalo place, clean plan, ektu royal touch." },
  { id: "tired", title: "Ektu tired", text: "Comfortable plan, beshi pressure nai." },
  { id: "playful", title: "Rag Rag Lagche", text: "Jai plan koro na keno khub Sabdhan." },
  { id: "surprise", title: "Surprise dao", text: "Do something that make me happy." },
];

const dateStyles = [
  { id: "quiet-dinner", title: "Dinner Night", text: "Calm table, easy vibe, easy plan.", icon: <RestaurantIcon /> },
  { id: "coffee-dessert", title: "Byke Drive and Dinner", text: "Short, simple, ar relaxed.", icon: <CoffeeIcon /> },
  { id: "movie-snacks", title: "Movie and Dinner", text: "Spiderman dekhbo then Dinner korbo.", icon: <MovieIcon /> },
  { id: "long-drive", title: "Long drive", text: "Music, city lights, ar no rush then dinner in some new place.", icon: <DirectionsCarIcon /> },
];

const cuisines = [
  "Italian",
  "Thai",
  "Chinese",
  "Kacchi or Biryani",
  "Buffet",
  "Sushi",
  "Pan Asian",
  "Jani na, surprise dao",
];

const timeSlots = ["Friday 7:00 PM", "Friday 7:30 PM", "Friday 8:00 PM", "Friday 8:30 PM"];
const dressCodes = ["Casual", "Elegant", "Comfy", "Matching color", "Valo jama nai, Kine daw"];

const moodLines = {
  cozy: "Bujhlam: Mohona er jonno shanto dinner ar comfortable plan bhalo hobe.",
  hungry: "Bujhlam: age food priority. Tarpor baki plan.",
  fancy: "Bujhlam: ektu elegant place ar neat plan thakle bhalo hobe.",
  tired: "Bujhlam: easy plan, beshi travel na, comfort first.",
  playful: "Bujhlam: khub sabdhane ekdom pixel perfect plan lagbe.",
  surprise: "Bujhlam: ami plan ready korbo, tmr kichu janar dorkar nai.",
};

const pageTitles = [
  "Welcome",
  "Golpo",
  "Mood",
  "Date Type",
  "Food",
  "Friday Time",
  "Confirm",
];

const totalSteps = pageTitles.length;

function OptionTile({ selected, icon, title, text, onClick }) {
  return (
    <Paper
      component="button"
      type="button"
      onClick={onClick}
      elevation={0}
      sx={{
        width: "100%",
        minHeight: 112,
        textAlign: "left",
        border: "1px solid",
        borderColor: selected ? "#e11d48" : "rgba(15,23,42,0.12)",
        bgcolor: selected ? "rgba(255,241,242,0.95)" : "rgba(255,255,255,0.78)",
        borderRadius: 2,
        p: 2,
        cursor: "pointer",
        transition: "transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease",
        boxShadow: selected ? "0 14px 28px rgba(225,29,72,0.14)" : "0 8px 20px rgba(15,23,42,0.06)",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: "#e11d48",
        },
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          {icon && <Box sx={{ color: selected ? "#e11d48" : "#0f766e", display: "flex" }}>{icon}</Box>}
          <Typography sx={{ fontWeight: 800, color: "#111827" }}>{title}</Typography>
          {selected && <CheckCircleIcon sx={{ ml: "auto", color: "#e11d48", fontSize: 18 }} />}
        </Stack>
        {text && <Typography sx={{ color: "#64748b", fontSize: 13, lineHeight: 1.45 }}>{text}</Typography>}
      </Stack>
    </Paper>
  );
}

function ChoiceButton({ selected, children, onClick }) {
  return (
    <Button
      type="button"
      variant={selected ? "contained" : "outlined"}
      onClick={onClick}
      sx={{
        width: "100%",
        justifyContent: "flex-start",
        borderRadius: 2,
        py: 1.25,
        px: 1.6,
        textTransform: "none",
        fontWeight: 800,
        bgcolor: selected ? "#e11d48" : "rgba(255,255,255,0.8)",
        borderColor: selected ? "#e11d48" : "rgba(15,23,42,0.16)",
        color: selected ? "#fff" : "#334155",
        "&:hover": { bgcolor: selected ? "#be123c" : "#fff", borderColor: "#e11d48" },
      }}
    >
      {children}
    </Button>
  );
}

export default function DateInvitation() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [step, setStep] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [convincing, setConvincing] = useState(false);
  const [answers, setAnswers] = useState({
    mood: "",
    style: "",
    cuisine: "",
    time: "",
    dress: "",
  });

  const progress = ((step + 1) / totalSteps) * 100;
  const selectedMood = moodOptions.find((item) => item.id === answers.mood);
  const selectedStyle = dateStyles.find((item) => item.id === answers.style);

  const canContinue = useMemo(() => {
    if (step === 0) return true;
    if (step === 1) return true;
    if (step === 2) return Boolean(answers.mood);
    if (step === 3) return Boolean(answers.style);
    if (step === 4) return Boolean(answers.cuisine);
    if (step === 5) return Boolean(answers.time && answers.dress);
    return true;
  }, [answers, step]);

  const setAnswer = (key, value) => setAnswers((prev) => ({ ...prev, [key]: value }));
  const goNext = () => setStep((prev) => Math.min(totalSteps - 1, prev + 1));
  const goBack = () => setStep((prev) => Math.max(0, prev - 1));

  const summary = [
    ["Mood", selectedMood?.title || "-"],
    ["Date type", selectedStyle?.title || "-"],
    ["Food", answers.cuisine || "-"],
    ["Time", answers.time || "-"],
    ["Dress", answers.dress || "-"],
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fff7ed",
        background: "linear-gradient(135deg, #fff7ed 0%, #ffe4e6 42%, #ecfeff 100%)",
        color: "#111827",
        py: { xs: 2, md: 5 },
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            minHeight: { xs: "calc(100vh - 32px)", md: 690 },
            display: "flex",
            flexDirection: "column",
            borderRadius: { xs: 3, md: 4 },
            border: "1px solid rgba(15,23,42,0.10)",
            overflow: "hidden",
            bgcolor: "rgba(255,255,255,0.82)",
            boxShadow: "0 24px 70px rgba(15,23,42,0.14)",
            backdropFilter: "blur(18px)",
          }}
        >
          <Box sx={{ px: { xs: 2, md: 4 }, pt: { xs: 2, md: 3 } }}>
            <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#111827", color: "#fff", display: "grid", placeItems: "center" }}>
                <FavoriteIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontWeight: 900, letterSpacing: 0 }}>For Mohona</Typography>
                <Typography sx={{ color: "#64748b", fontSize: 12 }}>{pageTitles[step]} - page {step + 1} of {totalSteps}</Typography>
              </Box>
              <Chip label="Date invite" size="small" sx={{ bgcolor: "#fff1f2", color: "#be123c", fontWeight: 800 }} />
            </Stack>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 99, bgcolor: "rgba(15,23,42,0.08)", "& .MuiLinearProgress-bar": { bgcolor: "#e11d48", borderRadius: 99 } }} />
          </Box>

          <Box sx={{ flex: 1, px: { xs: 2, md: 5 }, py: { xs: 3, md: 5 } }}>
            {step === 0 && (
              <Stack spacing={3} alignItems="flex-start">
                <Box
                  component="img"
                  src={mohonaImage}
                  alt="Mohona"
                  sx={{
                    width: "100%",
                    height: { xs: 380, md: 500 },
                    display: "block",
                    objectFit: "cover",
                    objectPosition: "center 32%",
                    borderRadius: 3,
                    border: "1px solid rgba(15,23,42,0.10)",
                    boxShadow: "0 18px 38px rgba(15,23,42,0.14)",
                  }}
                />
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, md: 2.4 },
                    borderRadius: 2,
                    bgcolor: "#fff",
                    border: "1px solid rgba(225,29,72,0.18)",
                    width: "100%",
                  }}
                >
                  <Stack spacing={1}>
                    <Typography sx={{ color: "#64748b", fontWeight: 800 }}>Hi, Mohona</Typography>
                    <Typography sx={{ color: "#111827", fontSize: { xs: 22, md: 28 }, fontWeight: 950, lineHeight: 1.15 }}>
                      The Queen of the Universe 🌍👑
                    </Typography>
                    <Stack spacing={0.7} sx={{ color: "#334155", pt: 0.5 }}>
                      <Typography sx={{ fontWeight: 800 }}>🐉 Dragon Queen</Typography>
                      <Typography sx={{ fontWeight: 800 }}>👑 CEO of The House</Typography>
                      <Typography sx={{ fontWeight: 800 }}>😌 Professional Mood Swing Expert</Typography>
                      <Typography sx={{ fontWeight: 800 }}>❤️ My Home</Typography>
                    </Stack>
                  </Stack>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: "#111827", color: "#fff", width: "100%" }}>
                  <Typography sx={{ fontWeight: 800 }}>Accha</Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.76)", mt: 0.6 }}>
                    Before that cholo tmk choto ekta golpo boli
                  </Typography>
                </Paper>
              </Stack>
            )}

            {step === 1 && (
              <Stack spacing={2.4}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 950 }}>Mohona, kichui change hoi nai bujhcho?</Typography>
                  <Typography sx={{ color: "#64748b", mt: 1 }}>Prothom jedin tmr sathe dekha holo, mone ache?</Typography>
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, md: 2.6 },
                    borderRadius: 2,
                    bgcolor: "#fff",
                    border: "1px solid rgba(15,23,42,0.10)",
                    boxShadow: "0 14px 32px rgba(15,23,42,0.07)",
                  }}
                >
                  <Stack spacing={1.6}>
                    <Typography sx={{ color: "#334155", fontSize: { xs: 16, md: 17 }, lineHeight: 1.8 }}>
                      Tmi koto bok bok kortechila. Ami je notun ekta manush tmr sathe dekha korte esechi, tmi bemalum bhulei gela. 🤷‍♂️
                    </Typography>
                    <Typography sx={{ color: "#334155", fontSize: { xs: 16, md: 17 }, lineHeight: 1.8 }}>
                      Prothom din thekei tmr golpo shonar ovvas amr hoye gelo. BTW tmi onek valo golpo bolte paro.
                    </Typography>
                    <Typography sx={{ color: "#334155", fontSize: { xs: 16, md: 17 }, lineHeight: 1.8 }}>
                      Erpor hut kore laf diye uthla, "amr phn koi, amr phone pacchi na." Tarpor tmr je mood switch ami dekhlam, I still can see it clearly.
                    </Typography>
                    <Typography sx={{ color: "#334155", fontSize: { xs: 16, md: 17 }, lineHeight: 1.8 }}>
                      Edik Odik khujte khujte Pura bag chele marla amr dike. Se phone ar khujei pawa jai na. Shanto sovab er meyetar matha pura hang hoye gelo. Amr phone khuje din , phone hariye felechi.
                    </Typography>
                    <Typography sx={{ color: "#334155", fontSize: { xs: 16, md: 17 }, lineHeight: 1.8 }}>
                      Duijon phone khujte khujte sesh porjonto phone ta pailam photocopy dokan e. Ektu age photocopy korte gechila, sekhanei fele rekhe aschila.
                    </Typography>
                    <Typography sx={{ color: "#9e1c24", fontSize: { xs: 16, md: 17 }, lineHeight: 1.8 }}>
                      Ami Sedin ei bujhchilam ei shundor cute baccha confused meyetake sarajibon thikmoto agle na rakhle , meyetar bipod er kono sesh thakbe na. 😉😜
                    </Typography>
                    <Typography sx={{ color: "#334155", fontSize: { xs: 16, md: 17 }, lineHeight: 1.8 }}>
                      First day tar each of the scene amr mone ache , tmr non stop golpo, tmr mood switch, tmr shanto sovab, tmr confused face, tmr hashi ar tmr sei notun pochonder jama , jeita dorji perfect fit korte parchilo na bole tmr ki raag.
                    </Typography>
                    <Typography sx={{ color: "#334155", fontSize: { xs: 16, md: 17 }, lineHeight: 1.8 }}>
                      Sedin ami kheyechilam bisri ek hot coffee ar tmi niyechile tar thekeo baje chini chara ek cold coffee, sedin er sei food er khesharot ami dite chai ei date a.
                    </Typography>

                  </Stack>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: "#fff1f2", border: "1px solid #fecdd3", width: "100%" }}>
                  <Typography sx={{ color: "#334155", fontWeight: 500, fontSize: { xs: 16, md: 17 }, lineHeight: 1.8 }}>
                    দেখো, আমাদের জীবনটাও আজ সেদিনের মতোই, তুমি কখনো খুব শান্ত, কখনো প্রচণ্ড কনফিউজড, অল্পতেই রাগ, কখনো সব দোষ শুধুই আমার, কিন্তু দিন শেষে আমি তুমি দুজনে সব সমাধান করে ফেলি...
                  </Typography>
                </Paper>
              </Stack>
            )}

            {step === 2 && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 950 }}>Mohona aj abohawa kemon tmr mood er ?</Typography>
                  <Typography sx={{ color: "#64748b", mt: 1 }}>ektu jante parle subidha hoi ar ki</Typography>
                </Box>
                <Grid container spacing={2}>
                  {moodOptions.map((item) => (
                    <Grid item xs={12} sm={6} key={item.id}>
                      <OptionTile selected={answers.mood === item.id} title={item.title} text={item.text} icon={<FavoriteIcon />} onClick={() => setAnswer("mood", item.id)} />
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            )}

            {step === 3 && (
              <Stack spacing={3}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, bgcolor: "#fff1f2", border: "1px solid #fecdd3" }}>
                  <Typography sx={{ fontWeight: 900, color: "#be123c" }}>Plan idea</Typography>
                  <Typography sx={{ mt: 0.8, color: "#334155", fontSize: 17 }}>{moodLines[answers.mood] || moodLines.surprise}</Typography>
                </Paper>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 950 }}>Ki type date bhalo lagbe?</Typography>
                  <Typography sx={{ color: "#64748b", mt: 1 }}>Ekta date type choose koro.</Typography>
                </Box>
                <Grid container spacing={2}>
                  {dateStyles.map((item) => (
                    <Grid item xs={12} sm={6} key={item.id}>
                      <OptionTile selected={answers.style === item.id} title={item.title} text={item.text} icon={item.icon} onClick={() => setAnswer("style", item.id)} />
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            )}

            {step === 4 && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 950 }}>Ebar important part: khabar.</Typography>
                  <Typography sx={{ color: "#64748b", mt: 1 }}>What kind of food are you craving right now?</Typography>
                </Box>
                <Grid container spacing={1.5}>
                  {cuisines.map((item) => (
                    <Grid item xs={12} sm={6} key={item}>
                      <ChoiceButton selected={answers.cuisine === item} onClick={() => setAnswer("cuisine", item)}>
                        <LocalDiningIcon sx={{ mr: 1, fontSize: 18 }} /> {item}
                      </ChoiceButton>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            )}

            {step === 5 && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 950 }}>Friday night er choto details.</Typography>
                  <Typography sx={{ color: "#64748b", mt: 1 }}>Time ar dress vibe choose koro.</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, mb: 1 }}>Kokhon free thakba?</Typography>
                  <Grid container spacing={1.5}>{timeSlots.map((item) => <Grid item xs={12} sm={6} key={item}><ChoiceButton selected={answers.time === item} onClick={() => setAnswer("time", item)}><CalendarMonthIcon sx={{ mr: 1, fontSize: 18 }} /> {item}</ChoiceButton></Grid>)}</Grid>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, mb: 1 }}>Dress vibe?</Typography>
                  <Grid container spacing={1.5}>{dressCodes.map((item) => <Grid item xs={12} sm={6} key={item}><ChoiceButton selected={answers.dress === item} onClick={() => setAnswer("dress", item)}>{item}</ChoiceButton></Grid>)}</Grid>
                </Box>
              </Stack>
            )}

            {step === 6 && (
              <Stack spacing={3}>
                {accepted ? (
                  <>
                    <Box sx={{ textAlign: "center", py: 2 }}>
                      <CheckCircleIcon sx={{ fontSize: 68, color: "#16a34a" }} />
                      <Typography variant="h3" sx={{ fontWeight: 950, mt: 1 }}>Plan confirmed.</Typography>
                      <Typography sx={{ color: "#64748b", mt: 1 }}>Friday night er plan set. Thank you, Mohona.</Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 950 }}>Mohona, Friday night amar sathe dinner/date e jaba?</Typography>
                      <Typography sx={{ color: "#64748b", mt: 1 }}>Jodi free thako, ami plan ta tomar choice moto set korbo.</Typography>
                    </Box>
                    {convincing && (
                      <Paper elevation={0} sx={{ p: 2.2, borderRadius: 2, bgcolor: "#ecfeff", border: "1px solid #a5f3fc" }}>
                        <Typography sx={{ fontWeight: 900, color: "#0f766e" }}>Plan ta simple</Typography>
                        <Stack spacing={0.7} sx={{ mt: 1.2, color: "#334155" }}>
                          <Typography>1. Restaurant tomar choice moto hobe.</Typography>
                          <Typography>2. Time comfortable na hole change kora jabe.</Typography>
                          <Typography>3. Plan short and relaxed rakha jabe.</Typography>
                        </Stack>
                      </Paper>
                    )}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                      <Button variant="contained" onClick={() => setAccepted(true)} sx={{ borderRadius: 2, py: 1.3, px: 3, bgcolor: "#e11d48", fontWeight: 900, textTransform: "none", "&:hover": { bgcolor: "#be123c" } }}>
                        Yes, jabo
                      </Button>
                      <Button variant="outlined" onClick={() => setConvincing(true)} sx={{ borderRadius: 2, py: 1.3, px: 3, fontWeight: 900, textTransform: "none", borderColor: "#e11d48", color: "#be123c" }}>
                        Plan details dekhao
                      </Button>
                    </Stack>
                  </>
                )}

                <Divider />
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.75)", border: "1px solid rgba(15,23,42,0.10)" }}>
                  <Typography sx={{ fontWeight: 900, mb: 1.5 }}>Date plan summary</Typography>
                  <Grid container spacing={1.2}>
                    {summary.map(([label, value]) => (
                      <Grid item xs={12} sm={6} key={label}>
                        <Box sx={{ p: 1.2, borderRadius: 1.5, bgcolor: "#fff", border: "1px solid rgba(15,23,42,0.08)" }}>
                          <Typography sx={{ color: "#64748b", fontSize: 12, fontWeight: 800 }}>{label}</Typography>
                          <Typography sx={{ color: "#111827", fontWeight: 900 }}>{value}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Stack>
            )}
          </Box>

          <Box sx={{ px: { xs: 2, md: 5 }, pb: { xs: 2, md: 4 }, mt: "auto" }}>
            <Divider sx={{ mb: 2 }} />
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <IconButton onClick={goBack} disabled={step === 0} sx={{ border: "1px solid rgba(15,23,42,0.12)", borderRadius: 2 }}>
                <ArrowBackIcon />
              </IconButton>
              {step < totalSteps - 1 && (
                <Button
                  variant="contained"
                  onClick={goNext}
                  disabled={!canContinue}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ borderRadius: 2, px: 3, fontWeight: 900, textTransform: "none", bgcolor: "#111827", "&:hover": { bgcolor: "#0f172a" } }}
                >
                  {step === 0 ? "samne jaw" : "Next"}
                </Button>
              )}
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
