export default function UseTeachBoardly() {
  return (
    <div className="bg-[#E597F2] text-black px-4 py-12 md:px-16">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2">
          How Educators & Students Use TeachBoardly
        </h1>
        <p className="text-sm md:text-base mb-12">
          From online teaching to one-on-one tutoring, discover how TeachBoardly transforms digital classrooms.
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-16">
        {/* Top Feature Row */}
        <div className="flex flex-col md:flex-row items-center gap-10">
          <img src="/assets/moon.png" alt="Teaching" className="w-full max-w-[220px] mx-auto md:mx-0" />
          <div className="flex-1">
            <h2 className="font-bold text-lg mb-1">Teaching Math and Science</h2>
            <p className="text-sm md:text-base">
              Easily explain formulas, draw diagrams, and solve problems in real-time. Perfect for visualizing complex math and science concepts with tools like graphs, rulers, and live annotations.
            </p>
          </div>
        </div>

        {/* Virtual Classrooms */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-10">
          <img src="/assets/laptop.png" alt="Virtual Classrooms" className="w-full max-w-[220px] mx-auto md:mx-0" />
          <div className="flex-1">
            <h2 className="font-bold text-lg mb-1">Virtual Classrooms</h2>
            <p className="text-sm md:text-base">
              Connect teachers and students anywhere with live, interactive lessons. Share screens, write on the whiteboard, and collaborate in real-time—making remote learning seamless and engaging.
            </p>
          </div>
        </div>

        {/* Interactive Learning */}
        <div className="flex flex-col md:flex-row items-center gap-10">
          <img src="/assets/peoples.png" alt="Interactive Learning" className="w-full max-w-[220px] mx-auto md:mx-0" />
          <div className="flex-1">
            <h2 className="font-bold text-lg mb-1">Interactive Learning for Students</h2>
            <p className="text-sm md:text-base">
              Engage students with hands-on activities, live quizzes, and real-time feedback to make learning active, fun, and effective.
            </p>
          </div>
        </div>

        {/* Testimonial */}
        <p className="italic font-medium text-center px-4">
          “With this whiteboard, I’ve made my online math sessions more engaging than ever before.” — Ms. Sara, Math Tutor
        </p>

        {/* Final Image */}
        <div className="flex justify-center">
          <img src="/assets/teach.png" alt="Online Tutoring" className="w-full max-w-xl" />
        </div>
      </div>
    </div>
  );
}
