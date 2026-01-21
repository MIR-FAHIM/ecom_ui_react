import React, { useEffect, useState, useRef } from "react";
import { Box, IconButton, CircularProgress } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { getBanner } from "../../../../api/controller/admin_controller/media/banner_controller";
import { image_file_url } from "../../../../api/config";

export default function Hero() {
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getBanner();
        const list = Array.isArray(res) ? res : res?.data || res?.data?.data || [];
        setBanners(list);
      } catch (e) {
        console.error("Failed to load banners:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!isPaused && banners.length > 1) {
      timerRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % banners.length);
      }, 5000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners, isPaused]);

  const prev = () => {
    if (!banners.length) return;
    setIndex((i) => (i - 1 + banners.length) % banners.length);
  };
  const next = () => {
    if (!banners.length) return;
    setIndex((i) => (i + 1) % banners.length);
  };

  const current = banners[index] || {};
  // Prefer returned `image` object (file_name or url), then `image_path`, then fallback
  let bg = "/assets/images/banner.jpg";
  if (current?.image?.file_name) {
    bg = `${image_file_url}/${current.image.file_name}`;
  } else if (current?.image?.url) {
    bg = current.image.url;
  } else if (current?.image_path) {
    bg = current.image_path.startsWith("http") ? current.image_path : `${image_file_url}/${current.image_path}`;
  }

  return (
    <Box
      sx={{
        height: 450,
        borderRadius: 2,
        mb: 4,
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          background: `url("${bg}") center/cover`,
        }}
      />

      {/* Navigation */}
      {banners.length > 1 && (
        <>
          <IconButton
            onClick={prev}
            sx={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#fff", bgcolor: "rgba(0,0,0,0.25)", '&:hover': { bgcolor: 'rgba(0,0,0,0.35)' } }}
          >
            <ChevronLeft />
          </IconButton>

          <IconButton
            onClick={next}
            sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "#fff", bgcolor: "rgba(0,0,0,0.25)", '&:hover': { bgcolor: 'rgba(0,0,0,0.35)' } }}
          >
            <ChevronRight />
          </IconButton>

          {/* Dots */}
          <Box sx={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 1 }}>
            {banners.map((_, i) => (
              <Box
                key={i}
                onClick={() => setIndex(i)}
                sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: i === index ? "#fff" : "rgba(255,255,255,0.45)", cursor: 'pointer' }}
              />
            ))}
          </Box>
        </>
      )}

      {/* Loading overlay */}
      {loading && (
        <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(0,0,0,0.2)" }}>
          <CircularProgress color="inherit" />
        </Box>
      )}
    </Box>
  );
}
