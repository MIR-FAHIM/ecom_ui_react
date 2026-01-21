import React, { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getTodayDealProduct } from "../../../../api/controller/admin_controller/product/product_controller";
import FeaturedTitle from "./FeaturedTitle";
import SmartProductCard from "./ProductCard";

const safeArray = (x) => (Array.isArray(x) ? x : []);

export default function TodayDealProduct({ onView }) {
    const theme = useTheme();
    const navigate = useNavigate();
    const upXl = useMediaQuery(theme.breakpoints.up("xl"));
    const upLg = useMediaQuery(theme.breakpoints.up("lg"));
    const upMd = useMediaQuery(theme.breakpoints.up("md"));
    const upSm = useMediaQuery(theme.breakpoints.up("sm"));

    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [startIndex, setStartIndex] = useState(0);

    const perView = useMemo(() => {
        if (upXl) return 5;
        if (upLg) return 4;
        if (upMd) return 3;
        if (upSm) return 2;
        return 1;
    }, [upXl, upLg, upMd, upSm]);

    const maxIndex = Math.max(0, items.length - perView);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const res = await getTodayDealProduct({ page: 1, per_page: 12 });
                const list = res?.data?.data ?? res?.data ?? res ?? [];
                if (mounted) setItems(safeArray(list));
            } catch (e) {
                console.error("loadTodayDealProducts error:", e);
                if (mounted) setItems([]);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        return () => {
            mounted = false;
        };
    }, []);

    const content = useMemo(() => {
        if (loading) {
            return (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (!items.length) {
            return (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No today deal products yet.
                </Typography>
            );
        }

        const slice = items.slice(startIndex, startIndex + perView);

        return (
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: `repeat(${perView}, minmax(0, 1fr))` }}>
                {slice.map((product) => (
                    <Box key={product.id} sx={{ minWidth: 0 }}>
                        <SmartProductCard
                            product={product}
                            onView={() => onView?.(product)}
                        />
                    </Box>
                ))}
            </Box>
        );
    }, [items, loading, onView, perView, startIndex]);

    const handlePrev = () => {
        setStartIndex((prev) => Math.max(0, prev - perView));
    };

    const handleNext = () => {
        setStartIndex((prev) => Math.min(maxIndex, prev + perView));
    };

    const handleSeeAll = () => {
        navigate("/home#all-products");
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 1 }}>
                <FeaturedTitle>Today Deals</FeaturedTitle>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, cursor: "pointer" }} onClick={handleSeeAll}>
                        See all
                    </Typography>
                    <IconButton size="small" onClick={handlePrev} disabled={startIndex === 0}>
                        <ChevronLeft fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={handleNext} disabled={startIndex >= maxIndex}>
                        <ChevronRight fontSize="small" />
                    </IconButton>
                </Box>
            </Box>
            {content}
        </Box>
    );
}