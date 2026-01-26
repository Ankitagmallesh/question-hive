import React from 'react';
import { PaperSettings } from '../types';
import { ChapterSelect } from './ChapterSelect';
import { RichTextEditor } from '../RichTextEditor';

interface SettingsFormProps {
    settings: PaperSettings;
    setSettings: React.Dispatch<React.SetStateAction<PaperSettings>>;
    chaptersList: {id: string, name: string}[];
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    showBranding: boolean;
    setShowBranding: (show: boolean) => void;
    showInstructions: boolean;
    setShowInstructions: (show: boolean) => void;
    showStudent: boolean;
    setShowStudent: (show: boolean) => void;
    showFooter: boolean;
    setShowFooter: (show: boolean) => void;
}

export const SettingsForm = ({
    settings,
    setSettings,
    chaptersList,
    setCurrentPage,
    handleLogoUpload,
    showBranding,
    setShowBranding,
    showInstructions,
    setShowInstructions,
    showStudent,
    setShowStudent,
    showFooter,
    setShowFooter
}: SettingsFormProps) => {
    return (
        <div className="settings-card">
            
            <div className="row">
                <div className="col" style={{flex: 1}}>
                    <label>Paper Title</label>
                    <input type="text" className="input-box" value={settings.title} onChange={e => setSettings({...settings, title: e.target.value})} />
                </div>
                <div className="col">
                    <label>Chapter</label>
                    <ChapterSelect 
                        options={chaptersList} 
                        selectedChapters={settings.chapters}
                        onChange={(val) => {
                            if (!settings.chapters.includes(val)) {
                                setSettings(s => ({...s, chapters: [...s.chapters, val]}));
                                setCurrentPage(1);
                            }
                        }}
                    />
                </div>
            </div>

            <div className="row">
                <div className="col" style={{flex: 0.8}}>
                    <label>Duration</label>
                    <input type="text" className="input-box" value={settings.duration} onChange={e => setSettings({...settings, duration: e.target.value})} />
                </div>
                <div className="col" style={{flex: 0.8}}>
                    <label>Total Marks</label>
                    <input type="text" className="input-box" value={settings.totalMarks} onChange={e => setSettings({...settings, totalMarks: e.target.value})} />
                </div>
                <div className="col">
                    <label>Difficulty Mix</label>
                    <div className="toggle-container">
                        {['easy', 'mixed', 'hard'].map(d => (
                            <button 
                                key={d}
                                className={`toggle-btn ${settings.difficulty === d ? 'active' : ''}`}
                                onClick={() => {
                                    setSettings({...settings, difficulty: d as any});
                                    setCurrentPage(1);
                                }}
                            >
                                {d.charAt(0).toUpperCase() + d.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="section-divider"></div>
            
            <div className="section-header" onClick={() => setShowBranding(!showBranding)}>
                <i className={`ri-arrow-down-s-line dropdown-icon ${showBranding ? 'rotated' : ''}`}></i>
                <div className="section-title"><i className="ri-layout-masonry-line"></i> Formatting & Branding</div>
            </div>

            <div className={`collapsible-content ${showBranding ? 'show' : ''}`} id="content-branding">
                <div className="row">
                    <div className="col" style={{flex: 2}}>
                        <label>Institution Name</label>
                        <input type="text" className="input-box" placeholder="e.g. St. Xavier's High School" value={settings.institution} onChange={e => setSettings({...settings, institution: e.target.value})} />
                    </div>
                    <div className="col">
                        <label>Logo Image</label>
                        <div className="file-upload-box" onClick={() => document.getElementById('logoInput')?.click()}>
                            <i className="ri-upload-cloud-2-line file-icon"></i>
                            <span style={{fontSize: '10px', fontWeight: 600, color: '#64748b'}}>
                                {settings.logo ? 'Change' : 'Upload'}
                            </span>
                            <input type="file" id="logoInput" hidden accept="image/*" onChange={handleLogoUpload} />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label>Logo Position</label>
                        <div className="visual-select">
                            {['left', 'center', 'right'].map((pos) => (
                                <div 
                                    key={pos}
                                    className={`visual-option ${settings.logoPosition === pos ? 'active' : ''}`}
                                    onClick={() => setSettings({...settings, logoPosition: pos as any})}
                                >
                                    <i className={`ri-align-${pos === 'center' ? 'center' : pos}`}></i>
                                    <span className="capitalize">{pos}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col">
                        <label>Page Layout</label>
                        <div className="visual-select">
                            <div className={`visual-option ${settings.layout === 'single' ? 'active' : ''}`} onClick={() => setSettings({...settings, layout: 'single'})}>
                                <div className="icon-box icon-1-col"></div> <span>Single</span>
                            </div>
                            <div className={`visual-option ${settings.layout === 'double' ? 'active' : ''}`} onClick={() => setSettings({...settings, layout: 'double'})}>
                                <div className="icon-box icon-2-col"></div> <span>2-Col</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label>Font Size <span className="range-value">{settings.fontSize}px</span></label>
                        <div className="range-slider-container">
                            <input type="range" className="range-slider" min="10" max="18" value={settings.fontSize} onInput={(e) => setSettings({...settings, fontSize: Number(e.currentTarget.value)})} />
                        </div>
                    </div>
                    <div className="col">
                        <label>Line Height <span className="range-value">{settings.lineHeight}</span></label>
                        <div className="range-slider-container">
                            <input type="range" className="range-slider" min="1.0" max="2.0" step="0.1" value={settings.lineHeight} onInput={(e) => setSettings({...settings, lineHeight: Number(e.currentTarget.value)})} />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label>Answer Space</label>
                        <select className="input-box" value={settings.answerSpace} onChange={e => setSettings({...settings, answerSpace: e.target.value as any})}>
                            <option value="none">None</option>
                            <option value="lines">Dotted Lines (2)</option>
                            <option value="box">Empty Box</option>
                        </select>
                    </div>
                    <div className="col">
                        <label>Separator Line</label>
                        <select className="input-box" value={settings.separator} onChange={e => setSettings({...settings, separator: e.target.value as any})}>
                            <option value="none">Hidden</option>
                            <option value="solid">Solid Black</option>
                            <option value="double">Double Line</option>
                            <option value="dashed">Dashed</option>
                        </select>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label>Page Border</label>
                        <select className="input-box" value={settings.pageBorder} onChange={e => setSettings({...settings, pageBorder: e.target.value as any})}>
                            <option value="none">None</option>
                            <option value="border-simple">Simple Line</option>
                            <option value="border-double">Double Line</option>
                        </select>
                    </div>
                    <div className="col">
                        <label>Font Family</label>
                        <select className="input-box" value={settings.font} onChange={e => setSettings({...settings, font: e.target.value as any})}>
                            <option value="jakarta">Jakarta Sans</option>
                            <option value="merriweather">Merriweather (Serif)</option>
                            <option value="inter">Inter</option>
                            <option value="mono">Mono</option>
                        </select>
                    </div>
                </div>
                 <div className="row">
                    <div className="col">
                        <label>Template</label>
                        <select className="input-box" value={settings.template} onChange={e => setSettings({...settings, template: e.target.value as any})}>
                            <option value="classic">Classic</option>
                            <option value="modern">Modern</option>
                            <option value="minimal">Minimal</option>
                        </select>
                    </div>
                    <div className="col">
                        <label>Margin</label>
                        <div className="toggle-container">
                            {['S', 'M', 'L'].map(m => (
                                <button 
                                    key={m}
                                    className={`toggle-btn ${settings.margin === m ? 'active' : ''}`}
                                    onClick={() => setSettings({...settings, margin: m as any})}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                        <label style={{marginTop: '8px'}}>Content Font Size</label>
                        <div className="range-slider-container">
                            <input type="range" className="range-slider" min="10" max="16" value={settings.metaFontSize} onInput={(e) => setSettings({...settings, metaFontSize: Number(e.currentTarget.value)})} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="section-divider"></div>
            <div className="section-header" onClick={() => setShowInstructions(!showInstructions)}>
                <i className={`ri-arrow-down-s-line dropdown-icon ${showInstructions ? 'rotated' : ''}`}></i>
                <div className="section-title"><i className="ri-file-list-3-line"></i> Instructions & Content</div>
            </div>
            <div className={`collapsible-content ${showInstructions ? 'show' : ''}`}>
                <div className="col">
                    <label>General Instructions</label>
                    <div className="rich-editor-container">
                        <div className="editor-toolbar">
                            <button className="tool-btn" onClick={() => document.execCommand('bold', false, '')}><b>B</b></button>
                            <button className="tool-btn" onClick={() => document.execCommand('italic', false, '')}><i>I</i></button>
                            <button className="tool-btn" onClick={() => document.execCommand('insertUnorderedList', false, '')}><i className="ri-list-unordered"></i></button>
                        </div>
                        <RichTextEditor 
                            initialValue={settings.instructions}
                            onChange={(html) => setSettings(prev => ({...prev, instructions: html}))}
                        />
                    </div>
                </div>
                <div className="row" style={{marginTop: '12px'}}>
                    <div className="col">
                        <label>Content Alignment</label>
                        <div className="visual-select">
                            {['left', 'center', 'justify'].map((align) => (
                                <div 
                                    key={align}
                                    className={`visual-option ${settings.contentAlignment === align ? 'active' : ''}`}
                                    onClick={() => setSettings({...settings, contentAlignment: align as any})}
                                >
                                    <i className={`ri-align-${align}`}></i>
                                    <span className="capitalize">{align}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col">
                        <label>Watermark Text</label>
                        <input type="text" className="input-box" placeholder="e.g. CONFIDENTIAL" value={settings.watermark || ''} onChange={e => setSettings({...settings, watermark: e.target.value})} />
                    </div>
                </div>
            </div>

            <div className="section-divider"></div>
            <div className="section-header" onClick={() => setShowStudent(!showStudent)}>
                <i className={`ri-arrow-down-s-line dropdown-icon ${showStudent ? 'rotated' : ''}`}></i>
                <div className="section-title"><i className="ri-user-smile-line"></i> Student Details</div>
            </div>
            <div className={`collapsible-content ${showStudent ? 'show' : ''}`}>
                <div className="checkbox-grid">
                    <label className="checkbox-label"><input type="checkbox" checked={settings.studentName} onChange={e => setSettings({...settings, studentName: e.target.checked})} /> Student Name</label>
                    <label className="checkbox-label"><input type="checkbox" checked={settings.rollNumber} onChange={e => setSettings({...settings, rollNumber: e.target.checked})} /> Roll Number</label>
                    <label className="checkbox-label"><input type="checkbox" checked={settings.classSection} onChange={e => setSettings({...settings, classSection: e.target.checked})} /> Class/Section</label>
                    <label className="checkbox-label"><input type="checkbox" checked={settings.dateField} onChange={e => setSettings({...settings, dateField: e.target.checked})} /> Date</label>
                    <label className="checkbox-label"><input type="checkbox" checked={settings.invigilatorSign} onChange={e => setSettings({...settings, invigilatorSign: e.target.checked})} /> Invigilator Sign</label>
                </div>
                
                <div className="row" style={{marginTop: '16px'}}>
                    <div className="col">
                        <label>Row Spacing <span className="range-value">{settings.studentDetailsGap || 12}px</span></label>
                        <div className="range-slider-container">
                            <input 
                                type="range" 
                                className="range-slider" 
                                min="8" 
                                max="40" 
                                step="4"
                                value={settings.studentDetailsGap || 12} 
                                onInput={(e) => setSettings({...settings, studentDetailsGap: Number(e.currentTarget.value)})} 
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="section-divider"></div>
            <div className="section-header" onClick={() => setShowFooter(!showFooter)}>
                <i className={`ri-arrow-down-s-line dropdown-icon ${showFooter ? 'rotated' : ''}`}></i>
                <div className="section-title"><i className="ri-layout-bottom-2-line"></i> Footer & Layout</div>
            </div>
            <div className={`collapsible-content ${showFooter ? 'show' : ''}`}>
                <div className="row">
                    <div className="col">
                        <label>Footer Text</label>
                        <input type="text" className="input-box" placeholder="e.g. Please Turn Over" value={settings.footerText} onChange={e => setSettings({...settings, footerText: e.target.value})} />
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <label>Rough Work Area</label>
                        <div className="toggle-container">
                            <button className={`toggle-btn ${settings.roughWorkArea === 'none' ? 'active' : ''}`} onClick={() => setSettings({...settings, roughWorkArea: 'none'})}>None</button>
                            <button className={`toggle-btn ${settings.roughWorkArea === 'right' ? 'active' : ''}`} onClick={() => setSettings({...settings, roughWorkArea: 'right'})}>Right Col</button>
                        </div>
                    </div>
                    <div className="col">
                        <label>Page Numbering</label>
                        <select className="input-box" value={settings.pageNumbering} onChange={e => setSettings({...settings, pageNumbering: e.target.value as any})}>
                            <option value="page-x-of-y">Page 1 of 5</option>
                            <option value="x-slash-y">1 / 5</option>
                            <option value="hidden">Hidden</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
