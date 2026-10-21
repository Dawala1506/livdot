"use client";
import { FormEvent, useState } from "react";
import { X, ImagePlus, UploadCloud } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";

export function CreateEventModal({ onClose }: { onClose: () => void }) {
  const { createEvent } = useEvents();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Community");
  const [date, setDate] = useState("2026-12-20");
  const [time, setTime] = useState("18:00");
  const [venue, setVenue] = useState("Lagos, Nigeria");
  const [price, setPrice] = useState("5000");
  const [image, setImage] = useState("https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85");
  const [imageName, setImageName] = useState("");
  const [error, setError] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date || !time || !venue.trim()) { setError("Please complete the event title, date, time and venue."); return; }
    createEvent({ title: title.trim(), category, date, time, venue: venue.trim(), price: Math.max(0, Number(price) || 0), image, description: "A new LIV DOT event. Add more details when you are ready.", capacity: 200 });
    onClose();
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={e => {if(e.target===e.currentTarget) onClose();}}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-title">
    <div className="modal-heading"><div><span className="eyebrow">NEW EXPERIENCE</span><h2 id="create-title">Create an event</h2><p>Start with the essentials. You can configure broadcast readiness later.</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19}/></button></div>
    <form onSubmit={submit} className="event-form">
      <label>Event title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. The Future Is Now" autoFocus/></label>
      <div className="form-row"><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}>{["Technology","Music","Design","Business","Food & Culture","Community","Film & Arts","Other"].map(x=><option key={x}>{x}</option>)}</select></label><label>Ticket price (₦)<input type="number" min="0" value={price} onChange={e=>setPrice(e.target.value)}/></label></div>
      <div className="form-row"><label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Start time<input type="time" value={time} onChange={e=>setTime(e.target.value)}/></label></div>
      <label>Venue / location<input value={venue} onChange={e=>setVenue(e.target.value)} placeholder="Enter event location"/></label>
      <label>Event cover image <span className="optional-label">Optional · JPG, PNG or WebP</span>
        <div className="image-upload-box">
          {image ? <img src={image} alt="Event cover preview" className="upload-preview"/> : <span className="upload-placeholder"><ImagePlus size={23}/></span>}
          <div className="upload-copy"><strong>{imageName || "Choose an event cover"}</strong><span>Upload an image from your device</span>
            <label className="button button-outline upload-button"><UploadCloud size={15}/> Browse image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>2*1024*1024){setError("Please choose an image smaller than 2 MB.");return;}const reader=new FileReader();reader.onload=()=>{setImage(String(reader.result));setImageName(file.name);setError("");};reader.readAsDataURL(file);}}/></label>
          </div>
        </div>
        <span className="image-url-fallback">Or paste an image URL</span>
        <div className="image-url-input"><ImagePlus size={17}/><input value={image.startsWith("data:") ? "" : image} onChange={e=>{setImage(e.target.value);setImageName("");}} placeholder="https://..."/></div>
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="modal-note">Your event will be created as a <strong>Draft</strong>. Assign a crew and configure streaming before going live.</div>
      <div className="modal-footer"><button type="button" className="button button-outline" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary">Create draft event</button></div>
    </form>
  </section></div>;
}
