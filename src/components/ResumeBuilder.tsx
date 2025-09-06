import React, { JSX, useState } from 'react';
import axios from 'axios';
import './ResumeBuilder.css';

// FIX: This is a safe way to handle the Axios response type, works in all environments
type AxiosResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: any;
};

// --- INTERFACES ---
interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  address?: string;
  linkedin?: string;
}

interface WorkExperience {
  job_title: string;
  company: string;
  location?: string;
  start_date: string;
  end_date: string;
  responsibilities: string[];
}

interface Education {
  degree: string;
  institution: string;
  location?: string;
  graduation_year: string;
  gpa?: string;
}

interface Project {
  title: string;
  description: string;
  technologies?: string[];
  start_date?: string;
  end_date?: string;
}

interface Certification {
  name: string;
  issuing_organization: string;
  date_obtained: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  preview_url?: string;
}

interface ResumeCreationResponse {
  success: boolean;
  resume_id: number;
  download_url: string;
  template_used: string;
  message: string;
}

interface ResumeBuilderProps {
  userId: string;
  mode?: 'create' | 'update';
  onComplete: (data: { download_url: string; resume_id?: number }) => void;
  onCancel?: () => void;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({
  userId,
  mode: _mode = 'create', // FIX: Prefix with _ to indicate it's intentionally unused for now
  onComplete,
  onCancel,
}) => {
  // --- STATE ---
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('professional');

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '', email: '', phone: '', address: '', linkedin: '',
  });

  const [professionalSummary, setProfessionalSummary] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([{
    job_title: '', company: '', location: '', start_date: '', end_date: '', responsibilities: [''],
  }]);

  const [education, setEducation] = useState<Education[]>([{
    degree: '', institution: '', location: '', graduation_year: '', gpa: '',
  }]);

  const [projects, setProjects] = useState<Project[]>([{
    title: '', description: '', technologies: [], start_date: '', end_date: ''
  }]);

  const [certifications, setCertifications] = useState<Certification[]>([{
    name: '', issuing_organization: '', date_obtained: ''
  }]);


  // --- DATA & HANDLERS ---

  const templates: Template[] = [
    {
      id: 'professional',
      name: 'Professional Template',
      description: 'Clean, traditional format perfect for corporate, law, or finance roles.',
      // TODO: Replace with your actual preview image URL
      preview_url: 'https://i.imgur.com/vEo48aC.png'
    },
    {
      id: 'modern',
      name: 'Modern Template',
      description: 'Contemporary design ideal for IT, engineering, or creative fields.',
       // TODO: Replace with your actual preview image URL
      preview_url: 'https://i.imgur.com/hJ3V6sF.png'
    }
  ];

  const addSkill = (): void => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (index: number): void => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addWorkExperience = (): void => {
    setWorkExperience([...workExperience, {
      job_title: '', company: '', location: '', start_date: '', end_date: '', responsibilities: ['']
    }]);
  };

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: string | string[]): void => {
    const updated = [...workExperience];
    updated[index] = { ...updated[index], [field]: value };
    setWorkExperience(updated);
  };

  const addResponsibility = (expIndex: number): void => {
    const updated = [...workExperience];
    updated[expIndex].responsibilities.push('');
    setWorkExperience(updated);
  };

  const updateResponsibility = (expIndex: number, respIndex: number, value: string): void => {
    const updated = [...workExperience];
    updated[expIndex].responsibilities[respIndex] = value;
    setWorkExperience(updated);
  };

  const addProject = (): void => {
    setProjects([...projects, { title: '', description: '', technologies: [], start_date: '', end_date: '' }]);
  };

  const updateProject = (index: number, field: keyof Project, value: string | string[]): void => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const addCertification = (): void => {
    setCertifications([...certifications, { name: '', issuing_organization: '', date_obtained: '' }]);
  };

  const updateCertification = (index: number, field: keyof Certification, value: string): void => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  };

  const handleSubmit = async (): Promise<void> => {
    setLoading(true);
    try {
      const resumeData = {
        user_id: userId,
        personal_info: personalInfo,
        professional_summary: professionalSummary,
        skills: skills.filter(s => s.trim() !== ''),
        work_experience: workExperience.filter(exp => exp.job_title && exp.company),
        education: education.filter(edu => edu.degree && edu.institution),
        projects: projects.filter(proj => proj.title),
        certifications: certifications.filter(cert => cert.name),
        template: selectedTemplate
      };

      const response: AxiosResponse<ResumeCreationResponse> = await axios.post(
        'http://localhost:8000/resumes/',
        resumeData
      );

      if (response.data.success) {
        onComplete({
          download_url: response.data.download_url,
          resume_id: response.data.resume_id,
        });
      } else {
        throw new Error(response.data.message || 'Resume generation failed');
      }
    } catch (error: any) {
      console.error('Resume generation failed', error);
      let errorMessage = 'Failed to generate resume. Please try again.';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateEducation = (index: number, field: keyof Education, value: string): void => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const TOTAL_STEPS = 6;

  const renderStep = (): JSX.Element | null => {
    switch (step) {
      case 0:
        return (
          <div className="form-step">
            <h2>Choose Your Resume Template</h2>
            <div className="template-selection">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <h3>{template.name}</h3>
                  <p>{template.description}</p>
                  {template.preview_url && <img src={template.preview_url} alt={`${template.name} preview`} className="template-preview"/>}
                </div>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
            <div className="form-step">
              <h2>Personal Information</h2>
              <div className="form-grid">
                <input type="text" placeholder="Full Name *" value={personalInfo.name} onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })} required />
                <input type="email" placeholder="Email Address *" value={personalInfo.email} onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })} required />
                <input type="tel" placeholder="Phone Number *" value={personalInfo.phone} onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })} required />
                <input type="text" placeholder="Address (e.g., City, Country)" value={personalInfo.address || ''} onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })} />
                <input type="url" placeholder="LinkedIn Profile URL" value={personalInfo.linkedin || ''} onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })} />
              </div>
            </div>
          );
      case 2:
        return (
            <div className="form-step">
              <h2>Professional Summary & Skills</h2>
              <textarea placeholder="Write a brief professional summary..." value={professionalSummary} onChange={(e) => setProfessionalSummary(e.target.value)} rows={4} className="full-width" />
              <div className="skills-section">
                <h3>Technical Skills</h3>
                <div className="skill-input">
                  <input type="text" placeholder="Add a skill and press Enter" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
                  <button type="button" onClick={addSkill}>Add</button>
                </div>
                <div className="skills-list">
                  {skills.map((skill, index) => (<span key={index} className="skill-tag">{skill} <button type="button" onClick={() => removeSkill(index)}>×</button></span>))}
                </div>
              </div>
            </div>
          );
      case 3:
        return (
            <div className="form-step">
              <h2>Work Experience</h2>
              {workExperience.map((exp, index) => (
                <div key={index} className="experience-item">
                  <h4>Experience {index + 1}</h4>
                  <div className="form-grid">
                    <input type="text" placeholder="Job Title *" value={exp.job_title} onChange={(e) => updateWorkExperience(index, 'job_title', e.target.value)} />
                    <input type="text" placeholder="Company *" value={exp.company} onChange={(e) => updateWorkExperience(index, 'company', e.target.value)} />
                    <input type="text" placeholder="Location" value={exp.location || ''} onChange={(e) => updateWorkExperience(index, 'location', e.target.value)} />
                    <input type="text" placeholder="Start Date" value={exp.start_date} onChange={(e) => updateWorkExperience(index, 'start_date', e.target.value)} />
                    <input type="text" placeholder="End Date" value={exp.end_date} onChange={(e) => updateWorkExperience(index, 'end_date', e.target.value)} />
                  </div>
                  <div className="responsibilities">
                    <h5>Key Responsibilities:</h5>
                    {exp.responsibilities.map((resp, respIndex) => (<input key={respIndex} type="text" placeholder={`Responsibility ${respIndex + 1}`} value={resp} onChange={(e) => updateResponsibility(index, respIndex, e.target.value)} />))}
                    <button type="button" onClick={() => addResponsibility(index)} className="add-btn">Add Responsibility</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addWorkExperience} className="add-btn">Add Another Experience</button>
            </div>
          );
      case 4:
        return (
            <div className="form-step">
              <h2>Education</h2>
              {education.map((edu, index) => (
                <div key={index} className="education-item">
                  <h4>Education {index + 1}</h4>
                  <div className="form-grid">
                    <input type="text" placeholder="Degree *" value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} />
                    <input type="text" placeholder="Institution *" value={edu.institution} onChange={(e) => updateEducation(index, 'institution', e.target.value)} />
                    <input type="text" placeholder="Location" value={edu.location || ''} onChange={(e) => updateEducation(index, 'location', e.target.value)} />
                    <input type="text" placeholder="Graduation Year" value={edu.graduation_year} onChange={(e) => updateEducation(index, 'graduation_year', e.target.value)} />
                    <input type="text" placeholder="GPA (optional)" value={edu.gpa || ''} onChange={(e) => updateEducation(index, 'gpa', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          );
      case 5:
        return (
          <div className="form-step">
            <h2>Projects</h2>
            {projects.map((proj, index) => (
              <div key={index} className="experience-item">
                <h4>Project {index + 1}</h4>
                <div className="form-grid-single">
                    <input type="text" placeholder="Project Title *" value={proj.title} onChange={(e) => updateProject(index, 'title', e.target.value)} />
                    <textarea placeholder="Project Description" value={proj.description} onChange={(e) => updateProject(index, 'description', e.target.value)} rows={3} />
                    <input type="text" placeholder="Technologies (comma-separated)" value={proj.technologies?.join(', ') || ''} onChange={(e) => updateProject(index, 'technologies', e.target.value.split(',').map(t => t.trim()))} />
                </div>
              </div>
            ))}
            <button type="button" onClick={addProject} className="add-btn">
              Add Another Project
            </button>
          </div>
        );
      case 6:
        return (
          <div className="form-step">
            <h2>Certifications</h2>
            {certifications.map((cert, index) => (
              <div key={index} className="experience-item">
                <h4>Certification {index + 1}</h4>
                <div className="form-grid">
                  <input type="text" placeholder="Certification Name *" value={cert.name} onChange={(e) => updateCertification(index, 'name', e.target.value)} />
                  <input type="text" placeholder="Issuing Organization" value={cert.issuing_organization} onChange={(e) => updateCertification(index, 'issuing_organization', e.target.value)} />
                  <input type="text" placeholder="Date Obtained" value={cert.date_obtained} onChange={(e) => updateCertification(index, 'date_obtained', e.target.value)} />
                </div>
              </div>
            ))}
            <button type="button" onClick={addCertification} className="add-btn">
              Add Another Certification
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const isStepValid = (): boolean => {
    switch (step) {
      case 0: return !!selectedTemplate;
      case 1: return !!(personalInfo.name && personalInfo.email && personalInfo.phone);
      default: return true;
    }
  };

  return (
    <div className="resume-builder">
      <div className="progress-bar">
        <div className="progress" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}></div>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {renderStep()}

        <div className="navigation-buttons">
          {onCancel && (
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
          )}
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)} className="prev-btn">
              Previous
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="next-btn"
              disabled={!isStepValid()}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="generate-btn"
              disabled={loading}
            >
              {loading ? 'Generating...' : `Generate ${templates.find(t => t.id === selectedTemplate)?.name}`}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ResumeBuilder;