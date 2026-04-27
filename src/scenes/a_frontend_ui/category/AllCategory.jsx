import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
  useTheme,
  Chip,
  Collapse,
  IconButton,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import FolderIcon from "@mui/icons-material/Folder";
import ArticleIcon from "@mui/icons-material/Article";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../theme";
import { image_file_url } from "../../../api/config/index.jsx";
import { getCategoryWithAllChildren } from "../../../api/controller/admin_controller/category/category_controller";

const safeArray = (value) => (Array.isArray(value) ? value : []);

const buildImageUrl = (media) => {
  if (!media) return "";
  const base = String(image_file_url || "").replace(/\/+$/, "");

  if (typeof media === "object") {
    const direct = media?.url || media?.external_link;
    if (direct && /^https?:\/\//i.test(String(direct))) return String(direct);
    const fileName = media?.file_name || media?.file_original_name;
    if (fileName) {
      const path = String(fileName).replace(/^\/+/, "");
      return `${base}/${path}`;
    }
  }

  const raw = String(media);
  if (/^https?:\/\//i.test(raw)) return raw;
  if (!base) return "";
  const path = raw.replace(/^\/+/, "");
  return `${base}/${path}`;
};

const countAllDescendants = (children = []) => {
  let total = 0;
  for (const child of children) {
    total += 1;
    total += countAllDescendants(safeArray(child.children));
  }
  return total;
};

// Level config: indent, font size, colors per depth
const LEVEL_CONFIG = [
  { indent: 0, fontSize: "0.82rem", dotSize: 7, lineColor: "primary.300" },
  { indent: 20, fontSize: "0.78rem", dotSize: 5, lineColor: "primary.300" },
  { indent: 40, fontSize: "0.74rem", dotSize: 4, lineColor: "primary.300" },
];

const getLevelConfig = (depth) =>
  LEVEL_CONFIG[Math.min(depth, LEVEL_CONFIG.length - 1)];

/**
 * Recursive tree node for a category child
 */
const TreeNode = ({ category, depth, navigate, colors, isLast }) => {
  const children = safeArray(category?.children);
  const hasChildren = children.length > 0;
  const [open, setOpen] = useState(depth === 0);

  const cfg = getLevelConfig(depth);

  return (
    <Box sx={{ position: "relative" }}>
      {/* Vertical connector line from parent */}
      {depth > 0 && (
        <Box
          sx={{
            position: "absolute",
            left: -12,
            top: 0,
            bottom: isLast ? "50%" : 0,
            width: "1px",
            background: colors.primary[300],
            zIndex: 0,
          }}
        />
      )}

      {/* Horizontal connector line */}
      {depth > 0 && (
        <Box
          sx={{
            position: "absolute",
            left: -12,
            top: "50%",
            width: 10,
            height: "1px",
            background: colors.primary[300],
            zIndex: 0,
          }}
        />
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          py: "3px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Expand toggle */}
        {hasChildren ? (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
            sx={{
              p: 0,
              width: 18,
              height: 18,
              flexShrink: 0,
              color: colors.gray[300],
              "&:hover": { color: colors.greenAccent?.[400] || colors.gray[100] },
            }}
          >
            {open ? (
              <ExpandLessIcon sx={{ fontSize: 14 }} />
            ) : (
              <ExpandMoreIcon sx={{ fontSize: 14 }} />
            )}
          </IconButton>
        ) : (
          <Box sx={{ width: 18, flexShrink: 0 }} />
        )}

        {/* Folder / leaf icon */}
        {hasChildren ? (
          open ? (
            <FolderOpenIcon
              sx={{ fontSize: 14, color: colors.greenAccent?.[400] || colors.gray[300], flexShrink: 0 }}
            />
          ) : (
            <FolderIcon
              sx={{ fontSize: 14, color: colors.gray[400], flexShrink: 0 }}
            />
          )
        ) : (
          <ArticleIcon
            sx={{ fontSize: 12, color: colors.gray[500], flexShrink: 0 }}
          />
        )}

        {/* Name */}
        <Typography
          variant="body2"
          onClick={() => category?.id && navigate(`/category/${category.id}`)}
          sx={{
            fontSize: cfg.fontSize,
            color: colors.gray[hasChildren ? 100 : 300],
            fontWeight: hasChildren ? 600 : 400,
            cursor: "pointer",
            lineHeight: 1.4,
            "&:hover": {
              color: colors.greenAccent?.[400] || colors.blueAccent?.[300] || "#56b3a0",
              textDecoration: "underline",
            },
          }}
        >
          {category?.name || "Unnamed"}
        </Typography>

        {/* Child count badge */}
        {hasChildren && (
          <Chip
            label={children.length}
            size="small"
            sx={{
              height: 16,
              fontSize: "0.62rem",
              fontWeight: 700,
              borderRadius: "4px",
              background: colors.primary[300],
              color: colors.gray[300],
              "& .MuiChip-label": { px: "5px" },
              flexShrink: 0,
            }}
          />
        )}
      </Box>

      {/* Recursive children */}
      {hasChildren && (
        <Collapse in={open} unmountOnExit>
          <Box sx={{ ml: 3, position: "relative" }}>
            {children.map((child, idx) => (
              <TreeNode
                key={child.id ?? child.name}
                category={child}
                depth={depth + 1}
                navigate={navigate}
                colors={colors}
                isLast={idx === children.length - 1}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

/**
 * Top-level category card — shows banner, name, stats, then tree of all children
 */
const CategoryCard = ({ category, navigate, colors }) => {
  const children = safeArray(category?.children);
  const totalDescendants = countAllDescendants(children);
  const banner = buildImageUrl(category?.banner || category?.icon || category?.cover_image);
  const [expanded, setExpanded] = useState(true);

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: `1px solid ${colors.primary[300]}`,
        background: colors.primary[500],
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          borderBottom: expanded && children.length > 0
            ? `1px solid ${colors.primary[300]}`
            : "none",
          cursor: "pointer",
          "&:hover": { background: colors.primary[400] },
          transition: "background 0.15s",
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Banner image */}
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2,
            overflow: "hidden",
            flexShrink: 0,
            background: colors.primary[400],
            border: `1px solid ${colors.primary[300]}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {banner ? (
            <Box
              component="img"
              src={banner}
              alt={category?.name}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <FolderIcon sx={{ fontSize: 24, color: colors.gray[400] }} />
          )}
        </Box>

        {/* Name + meta */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: colors.gray[100],
              letterSpacing: "-0.01em",
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            onClick={(e) => {
              e.stopPropagation();
              category?.id && navigate(`/category/${category.id}`);
            }}
          >
            {category?.name || "Category"}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 0.4, flexWrap: "wrap" }}>
            {children.length > 0 && (
              <Chip
                label={`${children.length} subcategories`}
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.65rem",
                  background: colors.primary[300],
                  color: colors.gray[300],
                  "& .MuiChip-label": { px: "6px" },
                }}
              />
            )}
            {totalDescendants > children.length && (
              <Chip
                label={`${totalDescendants} total`}
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.65rem",
                  background: colors.primary[300],
                  color: colors.gray[400],
                  "& .MuiChip-label": { px: "6px" },
                }}
              />
            )}
            {category?.featured === 1 && (
              <Chip
                label="Featured"
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.65rem",
                  background: colors.greenAccent?.[800] || "#1b4a3a",
                  color: colors.greenAccent?.[300] || "#4cceac",
                  "& .MuiChip-label": { px: "6px" },
                }}
              />
            )}
          </Box>
        </Box>

        {/* Expand toggle */}
        {children.length > 0 && (
          <IconButton
            size="small"
            sx={{
              color: colors.gray[400],
              flexShrink: 0,
              "&:hover": { color: colors.gray[100] },
            }}
          >
            {expanded ? (
              <ExpandLessIcon fontSize="small" />
            ) : (
              <ExpandMoreIcon fontSize="small" />
            )}
          </IconButton>
        )}
      </Box>

      {/* Children tree */}
      {children.length > 0 && (
        <Collapse in={expanded} unmountOnExit>
          <Box
            sx={{
              px: 2,
              pt: 1.5,
              pb: 2,
              background: colors.primary[100],
            }}
          >
            {children.map((child, idx) => (
              <TreeNode
                key={child.id ?? child.name}
                category={child}
                depth={0}
                navigate={navigate}
                colors={colors}
                isLast={idx === children.length - 1}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

// Stats bar at the top
const StatsBar = ({ categories, colors }) => {
  const totalCats = categories.length;
  const totalChildren = categories.reduce(
    (sum, c) => sum + countAllDescendants(safeArray(c.children)),
    0
  );
  const featured = categories.filter((c) => c.featured === 1).length;

  const stats = [
    { label: "Root categories", value: totalCats },
    { label: "Total subcategories", value: totalChildren },
    { label: "Featured", value: featured },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 2,
        mb: 3,
      }}
    >
      {stats.map((s) => (
        <Box
          key={s.label}
          sx={{
            background: colors.primary[400],
            border: `1px solid ${colors.primary[300]}`,
            borderRadius: 2,
            px: 2,
            py: 1.5,
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: colors.gray[100], lineHeight: 1 }}
          >
            {s.value}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: colors.gray[400], mt: 0.25, display: "block" }}
          >
            {s.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const AllCategory = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getCategoryWithAllChildren();
        const payload = res?.data ?? res;
        const list = safeArray(payload?.data ?? payload);
        setCategories(list);
      } catch (e) {
        console.error("Failed to load categories", e);
        setError("Failed to load categories.");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Recursively filter categories and children by search term
  const filterTree = useCallback((nodes, term) => {
    if (!term) return nodes;
    const lower = term.toLowerCase();

    const filterNode = (node) => {
      const match = node.name?.toLowerCase().includes(lower);
      const filteredChildren = filterNode_list(safeArray(node.children));
      if (match || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
      return null;
    };

    const filterNode_list = (list) =>
      list.map(filterNode).filter(Boolean);

    return filterNode_list(nodes);
  }, []);

  const displayed = filterTree(categories, search.trim());

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 4,
        background: theme.palette.background?.default || colors.primary[500],
      }}
    >
      <Container maxWidth="xl">
        {/* Page header */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: colors.gray[100],
              letterSpacing: "-0.02em",
            }}
          >
            All Categories
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: colors.gray[400], mt: 0.5 }}
          >
            Browse the full category hierarchy — expand any category to explore its subcategories.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={28} />
          </Box>
        ) : error ? (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        ) : (
          <>
            {/* Stats */}
            {categories.length > 0 && (
              <StatsBar categories={categories} colors={colors} />
            )}

            {/* Search bar */}
            <Box
              sx={{
                mb: 2.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                component="input"
                placeholder="Search categories…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                  flex: 1,
                  maxWidth: 380,
                  height: 38,
                  px: 1.5,
                  borderRadius: 2,
                  border: `1px solid ${colors.primary[300]}`,
                  background: colors.primary[400],
                  color: colors.gray[100],
                  fontSize: "0.85rem",
                  outline: "none",
                  "&::placeholder": { color: colors.gray[500] },
                  "&:focus": { borderColor: colors.greenAccent?.[500] || colors.gray[300] },
                }}
              />
              {search && (
                <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                  {displayed.length} result{displayed.length !== 1 ? "s" : ""}
                </Typography>
              )}
            </Box>

            {/* Category grid */}
            {displayed.length === 0 ? (
              <Typography variant="body2" sx={{ color: colors.gray[400] }}>
                {search ? "No categories match your search." : "No categories found."}
              </Typography>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, 1fr)",
                    xl: "repeat(3, 1fr)",
                  },
                  gap: 2,
                }}
              >
                {displayed.map((category) => (
                  <CategoryCard
                    key={category.id ?? category.name}
                    category={category}
                    navigate={navigate}
                    colors={colors}
                  />
                ))}
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default AllCategory;