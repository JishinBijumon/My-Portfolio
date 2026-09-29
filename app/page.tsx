'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const words = ['PCB Design', 'Embedded Systems', 'IoT Development', 'Hardware Prototyping'];
const projects = [
  { title: 'Brain Controlled Smart Wheelchair', type: 'Embedded', year: '2024', copy: 'Assistive mobility concept combining biosignal input, real-time control, and safe motor actuation.', tag: 'EEG · MCU · Motor control', className: 'wheelchair' },
  { title: 'Custom ESP32 PCB Design', type: 'PCB', year: '2024', copy: 'Compact ESP32 development board designed from schematic through layout and Gerber-ready output.', tag: 'KiCad · ESP32 · 2-layer PCB', className: 'esp' },
  { title: 'Elderly Health Monitoring System', type: 'IoT', year: '2023', copy: 'Connected monitoring concept for vital data, alerts, and remote visibility for caregivers.', tag: 'MQTT · Firebase · WiFi', className: 'health' },
  { title: 'Embedded Systems Mini Projects', type: 'Embedded', year: '2023—24', copy: 'A hands-on collection of peripheral interfacing, sensor, display, and automation builds.', tag: 'C · Arduino · STM32', className: 'mini' },
];

const skills = [
  ['01', 'PCB Design', 'KiCad, Altium, schematic design, PCB layout, component selection, Gerber generation.'],
  ['02', 'Embedded Systems', 'ESP32, Arduino, STM32, Embedded C, UART, SPI and I²C.'],
  ['03', 'IoT & Connectivity', 'Firebase, MQTT, WiFi, BLE, sensor integration and data dashboards.'],
  ['04', 'Programming', 'C, C++, Python, HTML, CSS and JavaScript for devices and interfaces.'],
  ['05', 'Hardware Validation', 'Oscilloscope, logic analyzer, multimeter, bring-up and debugging.'],
  ['06', 'Product Thinking', 'From a circuit idea to a testable, reliable hardware prototype.'],
];

function BoardArt({ variant }: { variant: string }) {
  return <div className={`board-art ${variant}`} aria-hidden="true"><span className="board-id">{variant === 'pcb' ? 'PCB / REV. 01' : variant === 'schematic' ? 'SCHEMATIC / 03' : '3D / BOARD'}</span><div className="board-chip">ESP<br />32</div><i className="trace a"/><i className="trace b"/><i className="trace c"/><i className="via one"/><i className="via two"/><i className="via three"/></div>;
}

export default function Home() {
  const [wordIndex, setWordIndex] = useState(0);
  const [filter, setFilter] = useState('All');
  useEffect(() => { const timer = setInterval(() => setWordIndex((current) => (current + 1) % words.length), 2400); return () => clearInterval(timer); }, []);
  const shown = filter === 'All' ? projects : projects.filter((project) => project.type === filter);

  return <main>
    <nav className="nav wrap"><a className="brand" href="#top"><span>◒</span> JISHIN.BG</a><div className="nav-links"><a href="#about">About</a><a href="#work">Work</a><a href="#contact">Contact</a></div><a className="nav-cta" href="mailto:jishinbiju004@gmail.com">Let&apos;s talk <b>↗</b></a></nav>
    <section id="top" className="hero wrap">
      <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="eyebrow"><i/> AVAILABLE FOR EMBEDDED &amp; PCB ROLES</motion.p>
      <div className="hero-grid"><div><motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}>Jishin<br />Bijumon <em>George.</em></motion.h1><p className="hero-summary">B.Tech Electronics &amp; Communication Engineering graduate building thoughtful, reliable hardware products—from board layout to embedded firmware.</p><div className="hero-actions"><a className="button solid" href="/ATS_Jishin_Bijumon_George_Resume_SinglePage.pdf" download>Download résumé <span>↓</span></a><a className="button ghost" href="#contact">Contact me <span>↗</span></a></div></div><motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .2 }} className="hero-board"><BoardArt variant="hero"/><div className="board-caption"><span>DESIGN / BUILD / TEST</span><strong>Hardware<br />that works.</strong></div></motion.div></div>
      <div className="role-line"><span>FOCUS</span><AnimatePresence mode="wait"><motion.b key={words[wordIndex]} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .3 }}>{words[wordIndex]}</motion.b></AnimatePresence><span className="cursor">_</span></div>
    </section>

    <section id="about" className="about section wrap"><p className="eyebrow">01 / ABOUT ME</p><div className="about-grid"><h2>Engineering with <em>curiosity</em> and care.</h2><div><p>I&apos;m an ECE graduate with a strong interest in PCB Design, Embedded Systems, IoT, and Hardware Product Development. I enjoy the rigorous, satisfying path from a raw circuit idea to a validated working prototype.</p><p>My goal is to build a career in embedded R&amp;D, contributing to products that are practical, robust, and genuinely useful.</p><dl><div><dt>LOCATION</dt><dd>Kerala, India</dd></div><div><dt>FOCUS</dt><dd>Hardware R&amp;D</dd></div></dl></div></div></section>

    <section className="skills section wrap"><p className="eyebrow">02 / CAPABILITIES</p><h2>I bring the board, the code, and the <em>connection</em> together.</h2><div className="skill-grid">{skills.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>

    <section className="experience section wrap"><p className="eyebrow">03 / EXPERIENCE</p><div className="timeline"><article><span>INTERNSHIP</span><h3>Evolve Robotics</h3><p>Hands-on exposure to robotics hardware, embedded systems workflows, and engineering collaboration.</p></article><article><span>INTERNSHIP</span><h3>NEST Digital</h3><p>Contributed to an IoT-based Elderly Health Monitoring System, connecting sensing, alerts, and cloud visibility.</p></article></div></section>

    <section id="work" className="work section wrap"><div className="section-head"><p className="eyebrow">04 / SELECTED WORK</p><p>Projects that demonstrate my approach to practical electronics, connected systems, and embedded development.</p></div><div className="filters">{['All', 'PCB', 'Embedded', 'IoT'].map((item) => <button className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div><motion.div layout className="project-grid">{shown.map((project) => <motion.article layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="project-card" key={project.title}><div className={`project-cover ${project.className}`}><span>{project.type.toUpperCase()}</span><div className="cover-graphic">{project.className === 'wheelchair' ? '◉' : project.className === 'health' ? '✚' : '⊞'}</div><small>{project.tag}</small></div><div className="project-details"><div><h3>{project.title}</h3><p>{project.copy}</p></div><span>{project.year}</span></div></motion.article>)}</motion.div></section>

    <section className="pcb-section section wrap"><div className="section-head"><p className="eyebrow">05 / PCB PORTFOLIO</p><p>Board-level work, from architecture to fabrication-ready output.</p></div><div className="pcb-grid"><article><BoardArt variant="pcb"/><h3>PCB layouts</h3><p>Layer-aware routing, placement, design rules and clean fabrication files.</p></article><article><BoardArt variant="schematic"/><h3>Schematics</h3><p>Clear circuit architecture, part selection, power design and signal flow.</p></article><article><BoardArt variant="render"/><h3>3D board views</h3><p>Mechanical awareness and assembly-ready design thinking.</p></article></div><p className="asset-note">Replace these technical visuals with your own KiCad / Altium screenshots, fabrication views, and 3D renders.</p></section>

    <section className="certifications section wrap"><p className="eyebrow">06 / CERTIFICATIONS</p><div className="cert-row"><div><span>01</span><h3>Engineering &amp; Embedded Learning</h3></div><p>Add your verified course, workshop, and platform certifications here.</p></div></section>

    <section className="github section wrap"><div><p className="eyebrow">07 / GITHUB</p><h2>Learning in public,<br />building in <em>practice.</em></h2></div><a className="github-link" href="https://github.com/JishinBijumon" target="_blank" rel="noreferrer"><span>github.com/JishinBijumon</span><b>↗</b></a></section>

    <section id="contact" className="contact"><div className="wrap"><p className="eyebrow">08 / CONTACT</p><h2>Let&apos;s build something<br /><em>real.</em></h2><div className="contact-grid"><a href="mailto:jishinbiju004@gmail.com">jishinbiju004@gmail.com <span>↗</span></a><a href="tel:+919037360398">+91 9037360398</a><a href="https://www.linkedin.com/in/jishin-bijumon-george-43759126b/" target="_blank" rel="noreferrer">LinkedIn <span>↗</span></a></div></div></section>
    <footer className="wrap"><p>© {new Date().getFullYear()} Jishin Bijumon George</p><p>PCB DESIGN · EMBEDDED SYSTEMS · IOT</p><a href="#top">Back to top ↑</a></footer>
  </main>;
}
