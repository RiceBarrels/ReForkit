"use client";

import { FaJs, FaReact, FaHtml5, FaCss3Alt, FaSass, FaJava, FaPython, FaPhp, FaSwift, FaKotlin } from 'react-icons/fa';
import { FaGolang } from "react-icons/fa6";
import { SiTypescript, SiKotlin } from 'react-icons/si';
import { LuFileJson } from 'react-icons/lu';
import { BiFontFamily } from 'react-icons/bi';
import { Info, PlayCircle, Music, FileText, Plus, Settings, Eye, SquarePlus } from 'lucide-react';

export const getFileIcon = (name) => {
    const extension = name.split('.').pop().toLowerCase();
    switch (extension) {
      case 'js':
        return <FaJs color="#f0db4f" size={16}/>;
      case 'ts':
        return <SiTypescript color="#3178c6" size={16}/>;
      case 'jsx':
        return <FaReact color="#82d8f7" size={16}/>;
      case 'tsx':
        return <FaReact color="#82d8f7" size={16}/>;
      case 'css':
        return <FaCss3Alt color="#3461ab" size={16}/>;
      case 'scss':
        return <FaSass color="#bf6c97" size={16}/>;
      case 'sass':
        return <FaSass color="#bf6c97" size={16}/>;
      case 'html':
        return <FaHtml5 color="#e34c26" size={16}/>;
      case 'json':
        return <LuFileJson color="#f1c40f" size={16}/>;
      case 'md':
        return <Info color="#1f7ced" size={16}/>;
      case 'java':
        return <FaJava color="#007396" size={16}/>;
      case 'py':
        return <FaPython color="#306998" size={16}/>;
      case 'php':
        return <FaPhp color="#777bb4" size={16}/>;
      case 'c':
        return <img src="/CP.svg" width={16} height={16} alt="C" />;
      case 'cpp':
        return <img src="/CPP.svg" width={16} height={16} alt="C++" />;
      case 'cs':
        return <img src="/CS.svg" width={16} height={16} alt="C#" />;
      case 'go':
        return <FaGolang color="#007396" size={16}/>;
      case 'rb':
        return <FileText color="#701516" size={16}/>;
      case 'swift':
        return <FaSwift color="#ffac45" size={16}/>;
      case 'kt':
      case 'kts':
      case 'kexe':
      case 'klib':
        return <SiKotlin color="#0095d5" size={16}/>;
      // Image files
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
      case 'webp':
      case 'ico':
      case 'heic':
      case 'heif':
      case 'hevc':
        return <img src="/Photo.svg" width={16} height={16} alt="Image" />;
      // Video files  
      case 'mp4':
      case 'webm':
      case 'ogg':
      case 'mov':
      case 'avi':
      case 'wmv': 
      case 'flv':
      case 'mkv':
        return <PlayCircle color="#1f7ced" size={16} />;
      // Audio files
      case 'mp3':
      case 'wav':
      case 'aac':
      case 'flac':
      case 'm4a':
        return <Music color="#1f7ced" size={16} />;
      // Font files  
      case 'ttf':
      case 'otf':
      case 'woff':
      case 'woff2':
      case 'eot':
        return <BiFontFamily color="#ba2d2d" size={16}/>;
      //reforkit files
      case 'reforkitsettings':
        return <img src="/Logo.svg" width={16} height={16} alt="Reforkit" />;
      case 'reforkit':
        return <img src="/Logo.svg" width={16} height={16} alt="Reforkit" />;

      //replit files
      case 'replit':
        return <img src="/replit.png" width={16} height={16} alt="Replit" />;
      case 'reforkitutilitytab':
        return <Settings size={16}/>;
      case 'reforkitpreviewtab':
        return <Eye size={16}/>;
      case 'reforkitnewtab':
        return <SquarePlus size={16}/>;
      default:
        return <FileText size={16}/>;
    }
  }