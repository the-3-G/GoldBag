// src/components/MarketCard.jsx
import React from "react";

export default function MarketCard({ item, placeholder }) {
  if (placeholder) {
    return (
      <div className="news-insight-card placeholder" />
    );
  }

  const title = item?.title || "Crypto News";
  const src = item?.source || item?.source_info?.name || "Source";

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="news-insight-card"
    >
      <div className="news-insight-inner">
        <div className="news-insight-badge">
          {Math.random() > 0.5 ? "TRENDING" : "BREAKING"}
        </div>
        <h4 className="news-insight-title">{title}</h4>
        <div className="news-insight-meta">
          <span>{src}</span>
          <span>
            {item.published_on
              ? `${Math.floor((Date.now() / 1000 - item.published_on) / 60)}m ago`
              : ""}
          </span>
        </div>
      </div>
    </a>
  );
}
