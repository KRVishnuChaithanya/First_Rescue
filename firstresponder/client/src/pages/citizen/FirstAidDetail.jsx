import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, PlayCircle, AlertTriangle } from 'lucide-react';
import { useGlobal } from '../../context/GlobalState';

const guideData = {
  cpr: {
    title: 'CPR (Cardiopulmonary Resuscitation)',
    color: 'bg-[#E24B4A]',
    steps: [
      'Check the scene for safety, then check the person.',
      'Tap their shoulder and shout, "Are you okay?"',
      'If no response and not breathing, call emergency services immediately.',
      'Place the heel of one hand on the center of the chest.',
      'Place your other hand on top and interlace your fingers.',
      'Push hard and fast (at least 2 inches deep, 100-120 pushes a minute).',
      'Let the chest rise completely between pushes.',
      'Keep going without stopping until help arrives.'
    ],
    warning: 'Do not attempt rescue breaths if you are untrained. Hands-only CPR is highly effective.'
  },
  bleeding: {
    title: 'Severe Bleeding',
    color: 'bg-[#A32D2D]',
    steps: [
      'Ensure your own safety. Use gloves if available.',
      'Apply direct, firm pressure to the wound with a clean cloth or bandage.',
      'Do not remove the cloth if it becomes soaked; add more layers on top.',
      'If bleeding is from a limb, elevate it above the heart if possible.',
      'Keep pressure applied constantly for at least 5-10 minutes.',
      'If bleeding does not stop, consider a tourniquet applied 2-3 inches above the wound.'
    ],
    warning: 'Never apply a tourniquet directly over a joint. Note the exact time the tourniquet was applied.'
  },
  fracture: {
    title: 'Fractures & Broken Bones',
    color: 'bg-[#F97316]',
    steps: [
      'Stop any bleeding by applying pressure to the edges of the wound.',
      'Immobilize the injured area. Do not try to realign the bone.',
      'If you have been trained, apply a splint to the area above and below the fracture.',
      'Apply ice packs to limit swelling and help relieve pain.',
      'Treat for shock if the person feels faint or is breathing in short, rapid breaths.'
    ],
    warning: 'Do not move the person if you suspect a head, neck, or back injury.'
  },
  burns: {
    title: 'Burns (Thermal & Chemical)',
    color: 'bg-[#F59E0B]',
    steps: [
      'Cool the burn immediately with cool (not cold) running water for at least 10 minutes.',
      'Remove any tight items (rings, belts) from the burned area before it swells.',
      'Do not break any blisters that form.',
      'Apply a clean, dry, loose bandage or cling film over the burn.',
      'For chemical burns, ensure all contaminated clothing is removed while flushing with water.'
    ],
    warning: 'Never apply ice, butter, ointments, or creams to a severe burn as this can trap heat and cause infection.'
  },
  choking: {
    title: 'Choking (Heimlich Maneuver)',
    color: 'bg-[#3B82F6]',
    steps: [
      'Ask the person, "Are you choking?" If they cannot cough or speak, act immediately.',
      'Stand behind the person and wrap your arms around their waist.',
      'Make a fist with one hand and place the thumb side just above their belly button.',
      'Grasp your fist with your other hand.',
      'Perform quick, upward abdominal thrusts as if trying to lift the person up.',
      'Continue thrusts until the object is forced out or the person becomes unconscious.'
    ],
    warning: 'If the person becomes unconscious, lower them to the floor and begin CPR immediately.'
  },
  unconscious: {
    title: 'Unconscious (Recovery Position)',
    color: 'bg-[#8B5CF6]',
    steps: [
      'Check for breathing. If breathing normally, proceed to the recovery position.',
      'Kneel next to the person on the floor.',
      'Place their arm nearest to you at a right angle to their body.',
      'Bring their other arm across their chest and hold the back of their hand against their nearest cheek.',
      'With your other hand, pull their far knee up until the foot is flat on the floor.',
      'Roll the person towards you onto their side by pulling on the bent knee.',
      'Tilt their head back slightly to keep the airway open.'
    ],
    warning: 'Do not use the recovery position if you suspect a spinal injury unless their airway is blocked by vomit or fluids.'
  }
};

export default function FirstAidDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useGlobal();
  const isVolunteer = location.state?.isVolunteer || currentUser?.role === 'volunteer';
  const guide = guideData[id];

  if (!guide) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <p>Guide not found.</p>
        <button onClick={() => navigate(-1)} className="ml-4 text-blue-500">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray pb-12">
      {/* Dynamic Header based on Guide Color */}
      <div className={`${guide.color} px-6 pt-12 pb-8 shadow-md rounded-b-[40px] relative z-10 text-white`}>
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="mr-4 hover:opacity-75 transition">
            <ChevronLeft size={28} />
          </button>
        </div>
        <h1 className="text-3xl font-heading font-black mb-2">{guide.title}</h1>
        <div className="flex items-center space-x-2 text-sm bg-black/20 w-max px-3 py-1 rounded-full backdrop-blur-sm">
          <PlayCircle size={16} />
          <span>Step-by-step instructions</span>
        </div>
      </div>

      <div className="px-6 -mt-4 relative z-20 space-y-6">
        
        {/* Warning Card */}
        <div className="bg-white rounded-3xl p-5 shadow-card border-l-4 border-yellow-500 flex items-start space-x-4 mt-8">
          <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-dark-black mb-1">Critical Warning</h3>
            <p className="text-sm text-text-secondary">{guide.warning}</p>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-3xl shadow-card border border-border overflow-hidden p-6">
          <h2 className="text-xl font-heading font-bold text-dark-black mb-6">Action Steps</h2>
          
          <div className="space-y-6">
            {guide.steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${guide.color} text-white font-bold text-sm`}>
                  {index + 1}
                </div>
                <p className="text-gray-700 leading-relaxed pt-1">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {!isVolunteer && (
          <button 
            onClick={() => navigate('/citizen-home', { state: { triggerSOS: true } })}
            className="w-full bg-primary-red text-white font-bold py-4 rounded-xl shadow-lg hover:bg-red-700 transition uppercase tracking-wide"
          >
            I Need Emergency Help Now
          </button>
        )}
      </div>
    </div>
  );
}
