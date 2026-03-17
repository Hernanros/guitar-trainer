import React, { useState } from 'react'
import useStore from '../../store/index.js'
import { TECHNIQUE_COLORS } from '../../data/exercises.js'

const TECHNIQUES = Object.keys(TECHNIQUE_COLORS)
const TIME_SIGS = ['4/4', '3/4', '6/8', '12/8', '2/4', '5/4']

const EMPTY_FORM = {
  name: '',
  technique: 'scales',
  description: '',
  startBpm: 60,
  targetBpm: 120,
  timeSignature: '4/4',
  howToPlay: '',
  tips: [''],
}

export default function AddExerciseModal({ onClose }) {
  const { addExerciseToLibrary } = useStore()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const setTip = (index, value) => {
    const tips = [...form.tips]
    tips[index] = value
    setForm((f) => ({ ...f, tips }))
  }

  const addTip = () => setForm((f) => ({ ...f, tips: [...f.tips, ''] }))

  const removeTip = (index) =>
    setForm((f) => ({ ...f, tips: f.tips.filter((_, i) => i !== index) }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.description.trim()) e.description = 'Required'
    if (!form.howToPlay.trim()) e.howToPlay = 'Required'
    if (form.startBpm >= form.targetBpm) e.targetBpm = 'Must be greater than start BPM'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    addExerciseToLibrary({
      ...form,
      startBpm: Number(form.startBpm),
      targetBpm: Number(form.targetBpm),
      tips: form.tips.filter((t) => t.trim()),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-100">Add Custom Exercise</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Exercise Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Chromatic Spider Walk"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Technique + Time Sig */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Technique</label>
              <select
                value={form.technique}
                onChange={(e) => set('technique', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
              >
                {TECHNIQUES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Time Signature</label>
              <select
                value={form.timeSignature}
                onChange={(e) => set('timeSignature', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
              >
                {TIME_SIGS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* BPM */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Start BPM</label>
              <input
                type="number"
                min={30}
                max={300}
                value={form.startBpm}
                onChange={(e) => set('startBpm', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Target BPM</label>
              <input
                type="number"
                min={30}
                max={300}
                value={form.targetBpm}
                onChange={(e) => set('targetBpm', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
              />
              {errors.targetBpm && <p className="text-red-400 text-xs mt-1">{errors.targetBpm}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Description *
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Brief overview of the exercise"
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-orange-500 resize-none"
            />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* How to Play */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              How to Play *
            </label>
            <textarea
              value={form.howToPlay}
              onChange={(e) => set('howToPlay', e.target.value)}
              placeholder="Step-by-step instructions"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-orange-500 resize-none"
            />
            {errors.howToPlay && <p className="text-red-400 text-xs mt-1">{errors.howToPlay}</p>}
          </div>

          {/* Tips */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Tips</label>
            <div className="space-y-2">
              {form.tips.map((tip, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={tip}
                    onChange={(e) => setTip(i, e.target.value)}
                    placeholder={`Tip ${i + 1}`}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
                  />
                  {form.tips.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTip(i)}
                      className="text-red-500 hover:text-red-300 px-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTip}
                className="text-orange-400 hover:text-orange-300 text-sm"
              >
                + Add tip
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Add to Library
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
